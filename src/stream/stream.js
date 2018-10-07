// Get our ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const musicMetadata = require('music-metadata');
const upath = require('upath');
const progress = require('cli-progress');

// Get our Services and helper fucntions
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

  // Let's create a nice progress bar
  // Using the song length as the 100%, as that is when the stream should end
  const songTotalDuration = Math.floor(metadata.format.duration);
  const progressBar = new progress.Bar(
    {
      format: 'Audio Progress {bar} {percentage}% | Time Playing: {duration_formatted}'
    },
    progress.Presets.shades_classic
  );
  progressBar.start(songTotalDuration, 0);

  // Create a new command
  ffmpegCommand = ffmpeg();

  // Set our ffmpeg path if we have one
  if (config.ffmpeg_path) {
    ffmpegCommand = ffmpegCommand.setFfmpegPath(config.ffmpeg_path);
  }

  // Add our audio as input
  ffmpegCommand = ffmpegCommand
    .input(randomSong)
    // Copy over the video audio
    .audioCodec('copy')
    .inputOptions([
      // Livestream, encode in realtime as audio comes in
      // https://superuser.com/questions/508560/ffmpeg-stream-a-file-with-original-playing-rate
      `-re`,
      // Add a short delay to beginning of video,
      // this fixes cut off on beginning and end on streaming platforms
      // https://superuser.com/questions/538031/what-is-difference-between-ss-and-itsoffset-in-ffmpeg
      `-itsoffset 2`
    ]);

  // Get our overlay text
  const overlayTextFilterString = await getOverlayTextString(path, config, typeKey, metadata);

  // Start creating our complex filter for overlaying things
  let complexFilterString = '';

  // Add our video as a movie filter, and our overlay
  // This is the only thing I could find to loop mp4
  // NOTE: Need to add , instead of semi colon. Comma will make the
  // filters applied in sucession, rather than create overlayed outputs per filter.
  // https://stackoverflow.com/questions/47885877/adding-loop-video-to-sound-ffmpeg
  // https://ffmpeg.org/ffmpeg-filters.html#movie-1
  // https://trac.ffmpeg.org/wiki/FilteringGuide#FiltergraphChainFilterrelationship
  doubleSlashOptimizedVideo = optimizedVideo.replace(/\\/g, '\\\\').replace(/:/g, '\\:');
  complexFilterString += `movie=\'${doubleSlashOptimizedVideo}\':loop=0,setpts=N/FRAME_RATE/TB`;

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
      ` [video];` +
      `[1:v][video] scale2ref [scaledoverlayimage][scaledvideo];` +
      `[scaledvideo][scaledoverlayimage] overlay=x=${imageObject.position_x}:y=${imageObject.position_y}`;
  }

  // Add our overlayText
  if (overlayTextFilterString) {
    complexFilterString += `,${overlayTextFilterString}`;
  }

  // Apply our complext filter
  ffmpegCommand = ffmpegCommand.complexFilter(complexFilterString);

  // Set our event handlers
  ffpmepgCommand = ffmpegCommand
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

  // Create our ouput options
  // Some defaults we don't want changed
  const outputOptions = [
    // Stop once the shortest input ends (audio)
    `-shortest`,
    // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites
    `-pix_fmt yuv420p`,
    // Setting keyframes, alternative newer option to -x264opts
    `-x264-params keyint=${config.video_fps * 2}:min-keyint=${config.video_fps * 2}:scenecut=-1`
  ];

  // Optional values
  if (config.video_fps) {
    outputOptions.push(`-r ${config.video_fps}`);
  } else {
    outputOptions.push(`-r 24`);
  }

  if (config.video_width && config.video_height) {
    outputOptions.push(`-s ${config.video_width}x${config.video_height}`);
  } else {
    outputOptions.push(`-s 480x854`);
  }

  if (config.video_bit_rate) {
    outputOptions.push(`-b:v ${config.video_bit_rate}`);
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
