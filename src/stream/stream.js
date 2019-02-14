// Get our ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const musicMetadata = require('music-metadata');
const upath = require('upath');
const progress = require('cli-progress');

// Get our Services and helper fucntions
const safeStrings = require('./safeStrings');
const historyService = require('../history.service');
const supportedFileTypes = require('../supportedFileTypes');
const getRandomFileWithExtensionFromPath = require('./randomFile');
const getOverlayTextString = require('./overlayText');

// Allow pre rendering the next video if needed
let nextVideo = undefined;
let nextTypeKey = undefined;

const getTypeKey = config => {
  let typeKey = 'radio';
  if (config.interlude.enabled) {
    const randomNumber = Math.random();
    const frequency = parseFloat(config.interlude.frequency, 10);
    if (randomNumber <= frequency) {
      typeKey = 'interlude';
    }
  }

  return typeKey;
};

const getVideo = async (path, config, typeKey, errorCallback) => {
  const randomVideo = await getRandomFileWithExtensionFromPath(
    supportedFileTypes.supportedVideoTypes,
    `${path}${config[typeKey].video_directory}`
  );

  // Do some optimizations to our video as we need
  let optimizedVideo;
  if (randomVideo.endsWith('.gif')) {
    // Optimize gif
    optimizedVideo = await require('./gif.js').getOptimizedGif(randomVideo, config, errorCallback);
  } else {
    optimizedVideo = randomVideo;
  }

  return {
    randomVideo: randomVideo,
    optimizedVideo: optimizedVideo
  };
};

// Function to start a stream
module.exports = async (path, config, outputLocation, endCallback, errorCallback) => {
  // Find what type of stream we want, radio, interlude, etc...
  let typeKey = 'radio';
  if (nextTypeKey) {
    typeKey = nextTypeKey;
    nextTypeKey = undefined;
  } else {
    typeKey = getTypeKey(config);
  }

  if (typeKey !== 'radio') {
    console.log(chalk.magenta(`Playing an ${typeKey}...`));
    console.log('\n');
  }

  console.log(chalk.magenta(`Finding audio... 🎤`));
  console.log('\n');

  // Find a random song from the config directory
  const randomSong = await getRandomFileWithExtensionFromPath(
    supportedFileTypes.supportedAudioTypes,
    `${path}${config[typeKey].audio_directory}`
  );

  console.log(chalk.blue(`Playing the audio:`));
  console.log(randomSong);
  console.log('\n');

  console.log(chalk.magenta(`Finding/Optimizing video... 📺`));
  console.log('\n');

  // Get the stream video
  let randomVideo;
  let optimizedVideo;
  if (nextVideo) {
    randomVideo = nextVideo.randomVideo;
    optimizedVideo = nextVideo.optimizedVideo;
    nextVideo = undefined;
  } else {
    const videoObject = await getVideo(path, config, typeKey, errorCallback);
    randomVideo = videoObject.randomVideo;
    optimizedVideo = videoObject.optimizedVideo;
  }

  console.log(chalk.blue(`Playing the video:`));
  console.log(randomVideo);
  console.log('\n');

  // Get the information about the song
  const metadata = await musicMetadata.parseFile(randomSong, { duration: true });

  // Log data about the song
  if (metadata.common.artist) {
    console.log(chalk.yellow(`Artist: ${metadata.common.artist}`));
  }
  if (metadata.common.album) {
    console.log(chalk.yellow(`Album: ${metadata.common.album}`));
  }
  if (metadata.common.title) {
    console.log(chalk.yellow(`Song: ${metadata.common.title}`));
  }
  console.log(chalk.yellow(`Duration (seconds): ${Math.ceil(metadata.format.duration)}`));
  console.log('\n');
  // Log a album cover if available
  if (metadata.common.picture && metadata.common.picture.length > 0) {
    // windows is not supported by termImg
    // process.platform always will be win32 on windows, no matter if it is 32bit or 64bit
    if (process.platform != 'win32') {
      try {
        const termImg = require('term-img');
        termImg(metadata.common.picture[0].data, {
          width: '300px',
          height: 'auto'
        });
        console.log('\n');
      } catch (e) {
        // Do nothing, we dont need the album art
      }
    }
  }

  // Create a new command
  ffmpegCommand = ffmpeg();

  // Set our ffmpeg path if we have one
  if (config.ffmpeg_path) {
    ffmpegCommand = ffmpegCommand.setFfmpegPath(config.ffmpeg_path);
  }

  // Add the video input
  ffmpegCommand = ffmpegCommand.input(optimizedVideo).inputOptions([
    // Loop the video infinitely
    `-stream_loop -1`
  ]);

  // Add our audio as input
  ffmpegCommand = ffmpegCommand.input(randomSong).audioCodec('copy');

  // Add a silent input
  // This is useful for setting the stream -re
  // pace, as well as not causing any weird bugs where we only have a video
  // And no audio output
  // https://trac.ffmpeg.org/wiki/Null#anullsrc
  ffmpegCommand = ffmpegCommand
    .input('anullsrc')
    .audioCodec('copy')
    .inputOptions([
      // Indicate we are a virtual input
      `-f lavfi`,
      // Livestream, encode in realtime as audio comes in
      // https://superuser.com/questions/508560/ffmpeg-stream-a-file-with-original-playing-rate
      // Need the -re here as video can drastically reduce input speed, and input audio has delay
      `-re`
    ]);

  // Start creating our complex filter for overlaying things
  let complexFilterString = '';

  // Add silence in front of song to prevent / help with stream cutoff
  // Since audio is streo, we have two channels
  // https://ffmpeg.org/ffmpeg-filters.html#adelay
  // In milliseconds
  const delayInMilli = 3000;
  complexFilterString += `[1:a] adelay=${delayInMilli}|${delayInMilli} [delayedaudio]; `;

  // Mix our silent and song audio, se we always have an audio stream
  // https://ffmpeg.org/ffmpeg-filters.html#amix
  complexFilterString += `[delayedaudio][2:a] amix=inputs=2:duration=first:dropout_transition=3 [audiooutput]; `;

  // Check if we want normalized audio
  if (config.normalize_audio) {
    // Use the loudnorm filter
    // http://ffmpeg.org/ffmpeg-filters.html#loudnorm
    complexFilterString += `[audiooutput] loudnorm [audiooutput]; `;
  }

  // Okay this some weirdness. Involving fps.
  // So since we are realtime encoding to get the video to stream
  // At an apporpriate rate, this means that we encode a certain number of frames to match this
  // Now, let's say we have a 60fps input video, and want to output 24 fps. This is fine and work
  // FFMPEG will output at ~24 fps (little more or less), and video will run at correct rate.
  // But if you noticed the output "Current FPS" will slowly degrade to either the input
  // our output fps. Therefore if we had an input video at lest say 8 fps, it will slowly
  // Degrade to 8 fps, and then we start buffering. Thus we need to use a filter to force
  // The input video to be converted to the output fps to get the correct speed at which frames are rendered
  let configFps = '24';
  if (config.video_fps) {
    configFps = config.video_fps;
  }
  complexFilterString += `[0:v] fps=fps=${configFps}`;

  // Add our overlay image
  // This works by getting the initial filter chain applied to the first
  // input, aka [0:v], and giving it a label, [videowithtext].
  // Then using the overlay filter to combine the first input, with the video of
  // a second input, aka [1:v], which in this case is our image.
  // Lastly using scale2ref filter to ensure the image size is consistent on all
  // videos. And scaled the image to the video, preserving video quality
  if (
    config[typeKey].overlay &&
    config[typeKey].overlay.enabled &&
    config[typeKey].overlay.image &&
    config[typeKey].overlay.image.enabled
  ) {
    // Add our image input
    const imageObject = config[typeKey].overlay.image;
    const imagePath = upath.join(path, imageObject.image_path);
    ffmpegCommand = ffmpegCommand.input(imagePath);
    complexFilterString +=
      ` [inputvideo];` +
      `[3:v][inputvideo] scale2ref [scaledoverlayimage][scaledvideo];` +
      // Notice the overlay shortest =1, this is required to stop the video from looping infinitely
      `[scaledvideo][scaledoverlayimage] overlay=x=${imageObject.position_x}:y=${imageObject.position_y}`;
  }

  // Add our overlayText
  const overlayTextFilterString = await getOverlayTextString(path, config, typeKey, metadata);
  if (overlayTextFilterString) {
    if (complexFilterString.length > 0) {
      complexFilterString += `, `;
    }
    complexFilterString += `${overlayTextFilterString}`;
  }

  // Set our final output video pad
  complexFilterString += ` [videooutput]`;

  // Apply our complext filter
  ffmpegCommand = ffmpegCommand.complexFilter(complexFilterString);

  // Let's create a nice progress bar
  // Using the song length as the 100%, as that is when the stream should end
  const songTotalDuration = Math.floor(metadata.format.duration);
  const progressBar = new progress.Bar(
    {
      format: 'Audio Progress {bar} {percentage}% | Time Playing: {duration_formatted} |'
    },
    progress.Presets.shades_classic
  );

  // Set our event handlers
  ffpmepgCommand = ffmpegCommand
    .on('start', commandString => {
      console.log(' ');
      console.log(`${chalk.blue('Spawned Ffmpeg with command:')}`);
      console.log(commandString);
      console.log(' ');

      // Start our progress bar
      progressBar.start(songTotalDuration, 0);
    })
    .on('end', () => {
      progressBar.stop();
      if (endCallback) {
        endCallback();
      }
    })
    .on('error', (err, stdout, stderr) => {
      progressBar.stop();

      if (errorCallback) {
        errorCallback(err, stdout, stderr);
      }
    })
    .on('progress', progress => {
      // Get our timestamp
      const timestamp = progress.timemark.substring(0, 8);
      const splitTimestamp = timestamp.split(':');
      const seconds = parseInt(splitTimestamp[0], 10) * 60 * 60 + parseInt(splitTimestamp[1], 10) * 60 + parseInt(splitTimestamp[2], 10);

      // Set seconds onto progressBar
      progressBar.update(seconds);
    });

  // Get our stream duration
  // This is done instead of using the -shortest flag
  // Because of a bug where -shortest can't be used with complex audio filter
  // https://trac.ffmpeg.org/ticket/3789
  // This will give us our song duration, plus some beginning and ending padding
  const delayInSeconds = Math.ceil(delayInMilli / 1000);
  const streamDuration = delayInSeconds * 2 + Math.ceil(metadata.format.duration);

  // Create our ouput options
  // Some defaults we don't want change
  const outputOptions = [
    `-map [videooutput]`,
    `-map [audiooutput]`,
    // Our fps from earlier
    `-r ${configFps}`,
    // Group of pictures, want to set to 2 seconds
    // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites
    // https://www.addictivetips.com/ubuntu-linux-tips/stream-to-twitch-command-line-linux/
    `-g ${parseInt(configFps, 10) * 2}`,
    `-keyint_min ${configFps}`,
    // Stop audio once we hit the specified duration
    `-t ${streamDuration}`,
    // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites
    `-pix_fmt yuv420p`
    // Setting keyframes, alternative newer option to -x264opts
    // `-x264-params keyint=${config.video_fps * 3}:min-keyint=${config.video_fps * 3}:scenecut=0`
  ];

  if (config.video_width && config.video_height) {
    outputOptions.push(`-s ${config.video_width}x${config.video_height}`);
  } else {
    outputOptions.push(`-s 480x854`);
  }

  if (config.video_bit_rate) {
    outputOptions.push(`-b:v ${config.video_bit_rate}`);
    outputOptions.push(`-minrate ${config.video_bit_rate}`);
    outputOptions.push(`-maxrate ${config.video_bit_rate}`);
  }

  if (config.audio_bit_rate) {
    outputOptions.push(`-b:a ${config.audio_bit_rate}`);
  }

  if (config.audio_sample_rate) {
    outputOptions.push(`-ar ${config.audio_sample_rate}`);
  }

  // Set our audio codec, this can drastically affect performance
  if (config.audio_codec) {
    outputOptions.push(`-acodec ${config.audio_codec}`);
  } else {
    outputOptions.push(`-acodec aac`);
  }

  // Set our video codec, and encoder options
  // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites
  if (config.video_codec) {
    outputOptions.push(`-vcodec ${config.video_codec}`);
  } else {
    outputOptions.push(`-vcodec libx264`);
  }
  if (config.preset) {
    outputOptions.push(`-preset ${config.preset}`);
  }
  if (config.bufsize) {
    outputOptions.push(`-bufsize ${config.bufsize}`);
  }
  if (config.crf) {
    outputOptions.push(`-crf ${config.crf}`);
  }
  if (config.threads) {
    outputOptions.push(`-threads ${config.threads}`);
  }

  // Finally, save the stream to our stream URL
  let singleOutputLocation = '';
  if (Array.isArray(outputLocation)) {
    singleOutputLocation = outputLocation[0];
  } else {
    singleOutputLocation = outputLocation;
  }

  // Add our output options for the stream
  ffmpegCommand = ffmpegCommand.outputOptions([
    ...outputOptions,
    // Set format to flv (Youtube/Twitch)
    `-f flv`
  ]);

  ffmpegCommand = ffmpegCommand.save(singleOutputLocation);

  // Start some pre-rendering
  const preRenderTask = async () => {
    nextTypeKey = getTypeKey(config);
    nextVideo = await getVideo(path, config, nextTypeKey, errorCallback);
  };
  preRenderTask();

  // Add this item to our history
  const historyMetadata = metadata.common;
  delete historyMetadata.picture;
  historyService.addItemToHistory({
    audio: {
      path: randomSong,
      metadata: historyMetadata
    },
    video: {
      path: randomVideo
    }
  });

  return ffmpegCommand;
};
