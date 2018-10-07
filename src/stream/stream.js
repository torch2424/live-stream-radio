// Get our ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const musicMetadata = require('music-metadata');
const upath = require('upath');
const progress = require('cli-progress');

// Get our Services and helper fucntions
const getRandomFileWithExtensionFromPath = require('./randomFile');
const historyService = require('../history.service');
const supportedFileTypes = require('../supportedFileTypes');

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

  // Create our overlay
  // Note: Positions and sizes are done relative to the input video width and height
  // Therefore position x/y is a percentage, like CSS style.
  // Font size is simply just a fraction of the width
  let overlayTextFilterString = '';
  if (config[typeKey].overlay && config[typeKey].overlay.enabled) {
    const overlayConfigObject = config[typeKey].overlay;
    const overlayTextItems = [];

    const fontPath = `${path}${overlayConfigObject.font_path}`;

    // Check if we have a title option
    if (overlayConfigObject.title && overlayConfigObject.title.enabled) {
      const itemObject = overlayConfigObject.title;
      let itemString =
        `drawtext=text='${itemObject.text}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})`;
      if (itemObject.enable_scroll) {
        itemString += `:x=w-mod(max(t\\, 0) * (w + tw) / ${itemObject.font_scroll_speed}\\, (w + tw))`;
      } else {
        itemString += `:x=(w * ${itemObject.position_x / 100})`;
      }
      overlayTextItems.push(itemString);
    }

    // Check if we have an artist option
    if (overlayConfigObject.artist && overlayConfigObject.artist.enabled) {
      const itemObject = overlayConfigObject.artist;
      let itemString =
        `drawtext=text='${itemObject.label}${metadata.common.artist}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`;
      overlayTextItems.push(itemString);
    }

    // Check if we have an album option
    if (overlayConfigObject.album && overlayConfigObject.album.enabled) {
      const itemObject = overlayConfigObject.album;
      let itemString =
        `drawtext=text='${itemObject.label}${metadata.common.album}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`;
      overlayTextItems.push(itemString);
    }

    // Check if we have an artist option
    if (overlayConfigObject.song && overlayConfigObject.song.enabled) {
      const itemObject = overlayConfigObject.song;
      let itemString =
        `drawtext=text='${itemObject.label}${metadata.common.title}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`;
      overlayTextItems.push(itemString);
    }

    // Add our video filter with all of our overlays
    overlayTextItems.forEach((item, index) => {
      overlayTextFilterString += `${item}`;
      if (index < overlayTextItems.length - 1) {
        overlayTextFilterString += ',';
      }
    });
  }

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

  // Add our output options for the stream
  ffmpegCommand = ffmpegCommand.outputOptions([
    // Stop once the shortest input ends (audio)
    `-shortest`,
    // Add our fps
    `-r ${config.video_fps}`,
    // Define our video size
    `-s ${config.video_width}x${config.video_height}`,
    // Set video bitrate
    `-b:v ${config.video_bit_rate}`,
    // Set audio bitrate
    `-b:a ${config.audio_bit_rate}`,
    // Set audio sample rate
    `-ar ${config.audio_sample_rate}`,
    // Set our audio codec, this can drastically affect performance
    `-acodec ${config.audio_codec}`,
    // Set our video codec, and encoder options
    // https://trac.ffmpeg.org/wiki/EncodingForStreamingSites
    `-vcodec ${config.video_codec}`,
    `-preset ${config.preset}`,
    `-pix_fmt yuv420p`,
    `-bufsize ${config.bufsize}`,
    `-crf ${config.crf}`,
    `-x264-params keyint=${config.video_fps * 2}:min-keyint=${config.video_fps * 2}:scenecut=-1`,
    // Set the maximum number of threads ffmpeg should use
    // This is useful for maxing sure ffmpeg wont use 100% of cpu
    `-threads ${config.threads}`,
    // Set format to flv (Youtube/Twitch)
    `-f flv`
  ]);

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

  // Finally, save the stream to our stream URL
  ffmpegCommand = ffmpegCommand.save(outputLocation);

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
