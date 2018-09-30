// Get our ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const ffmpegError = require('./error.js').ffmpegError;
const chalk = require('chalk');
const termImg = require('term-img');
const find = require('find');
const musicMetadata = require('music-metadata');
const progress = require('cli-progress');

// Async Function to get a random file from a path
const getRandomFileWithExtensionFromPath = async (extensions, path) => {

  // Find al of our files with the extensions
  let allFiles = [];
  extensions.forEach(extension => {
    allFiles = [
      ...allFiles,
      ...find.fileSync(extension, path)
    ];
  });

  // Return a random file
  return allFiles[Math.floor(Math.random() * allFiles.length)];
}


// Recursive function to stream repeatedly
const stream = async (path, config) => {

  // Find what type of stream we want, radio, interlude, etc...
  const typeKey = "radio";
  const randomNumber = Math.random();
  if (randomNumber <= config.interlude.frequency) {
    const typeKey = "interlude";
  }
  
  // Find a random song from the config directory
  const randomSong = await getRandomFileWithExtensionFromPath(
    [
      /\.mp3$/
    ],
    `${path}${config[typeKey].audio_directory}`
  );
  

  console.log(chalk.blue(`Playing the audio:`));
  console.log(randomSong);
  console.log('\n'); 

  // Get the stream video
  let randomVideo = await getRandomFileWithExtensionFromPath(
    [
      /\.mp4$/,
      /\.webm$/,
      /\.gif$/,
    ],
    `${path}${config[typeKey].video_directory}`
  );

  console.log(chalk.blue(`Playing the video:`));
  console.log(randomVideo);
  console.log('\n'); 

  // Do some optimizations to our video as we need
  let optimizedVideo;
  if (randomVideo.endsWith('.gif')) {
    // Optimize gif
    optimizedVideo = await require('./gif.js').getOptimizedGif(randomVideo, config);
  } else {
    optimizedVideo = randomVideo;
  }

  // Get the information about the song
  const metadata = await musicMetadata.parseFile(randomSong, {duration: true});

  // Log data about the song
  console.log(chalk.magenta(`Artist: ${metadata.common.artist}`));
  console.log(chalk.magenta(`Album: ${metadata.common.album}`));
  console.log(chalk.magenta(`Song: ${metadata.common.title}`));
  console.log('\n');
  // Log a album cover if available
  if (metadata.common.picture && metadata.common.picture.length > 0) {
    termImg(metadata.common.picture[0].data, {
      width: '300px',
      height: 'auto'
    });
    console.log('\n');
  }


  // Let's create a nice progress bar
  // Using the song length as the 100%, as that is when the stream should end
  const songTotalDuration = Math.floor(metadata.format.duration);
  const progressBar = new progress.Bar({
    format: 'Audio Progress {bar} {percentage}% | Time Playing: {duration_formatted}'
  }, progress.Presets.shades_classic);
  progressBar.start(songTotalDuration, 0);
  
  //  Build our stream url 
  let streamUrl = config.stream_url;
  streamUrl = streamUrl.replace('$stream_key', config.stream_key);

  // Create our command
  let ffmpegCommand = ffmpeg();

  // Add our audio as input
  ffmpegCommand = ffmpegCommand.input(randomSong)
    // Copy over the video audio
    .audioCodec('copy')
    // Livestream, encode in realtime as audio comes in
    // https://superuser.com/questions/508560/ffmpeg-stream-a-file-with-original-playing-rate
    .inputOptions(
      `-re`
    );

  // Create our overlay
  let overlayFilterString = '';
  if (config[typeKey].overlay && config[typeKey].overlay.enabled) {
    
    const overlayConfigObject = config[typeKey].overlay;
    const overlayItems = [];

    const fontPath = `${path}${overlayConfigObject.font}`;

    // Check if we have a title option
    if(overlayConfigObject.title && overlayConfigObject.title.enabled) {
      const itemObject = overlayConfigObject.title;
      let itemString = `drawtext=text='${itemObject.text}'` + 
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
      overlayItems.push(itemString);
    }

    // Check if we have an artist option
    if(overlayConfigObject.artist && overlayConfigObject.artist.enabled) {
      const itemObject = overlayConfigObject.artist;
      let itemString = `drawtext=text='${itemObject.label}\\: ${metadata.common.artist}'` + 
        `:fontfile=${fontPath}` + 
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` + 
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`
      overlayItems.push(itemString);
    }

    // Check if we have an album option
    if(overlayConfigObject.album && overlayConfigObject.album.enabled) {
      const itemObject = overlayConfigObject.album;
      let itemString = `drawtext=text='${itemObject.label}\\: ${metadata.common.album}'` + 
        `:fontfile=${fontPath}` +         
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` + 
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`
      overlayItems.push(itemString);
    }

    // Check if we have an artist option
    if(overlayConfigObject.song && overlayConfigObject.song.enabled) {
      const itemObject = overlayConfigObject.song;
      let itemString = `drawtext=text='${itemObject.label}\\: ${metadata.common.title}'` + 
        `:fontfile=${fontPath}` + 
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` + 
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`
      overlayItems.push(itemString);
    }

    // Add our video filter with all of our overlays
    overlayItems.forEach((item, index) => {
      overlayFilterString += `${item}`;
      if (index < overlayItems.length - 1) {
        overlayFilterString += ',';
      }
    });
  }

  // Add our video as a movie filter, and our overlay
  // This is the only thing I could find to loop mp4
  // NOTE: Need to add , instead of semi colon. Comma will make the 
  // filters applied in sucession, rather than create overlayed outputs per filter.
  // https://stackoverflow.com/questions/47885877/adding-loop-video-to-sound-ffmpeg
  // https://ffmpeg.org/ffmpeg-filters.html#movie-1
  // https://trac.ffmpeg.org/wiki/FilteringGuide#FiltergraphChainFilterrelationship
  ffmpegCommand = ffmpegCommand
    .complexFilter(
      `movie=${optimizedVideo}:loop=0,setpts=N/FRAME_RATE/TB,` + 
      `${overlayFilterString}`
    );


  // Add our output options for the stream
  ffmpegCommand = ffmpegCommand.outputOptions([
    // Stop once the shortest input ends (audio)
    `-shortest`,
    // Add our fps
    `-r ${config.video_fps}`,
    // Define our video size
    `-s ${config.video_width}x${config.video_height}`,
    // Set format to flv (Youtube/Twitch)
    `-f flv`
  ]);

  // Set our event handlers
  ffpmepgCommand = ffmpegCommand
    // TODO: Restart stream
    .on('end', () => {
      console.log('DONE!');
      progressBar.stop();
    })
    .on('error', ffmpegError(progressBar.stop))
    .on('progress', (progress) => {
      // Get our timestamp
      const timestamp = progress.timemark.substring(0, 8)
      const splitTimestamp = timestamp.split(':');
      const seconds = (parseInt(splitTimestamp[0], 10) * 60 * 60) + (parseInt(splitTimestamp[1], 10) * 60) + parseInt(splitTimestamp[2], 10);

      // Set seconds onto progressBar
      progressBar.update(seconds);
    });

  // Finally, save the stream to our stream URL
  //ffmpegCommand.save(streamUrl);
  ffmpegCommand.save('test.flv');
}

// Finally our exports
module.exports = (path, config) => {

  console.log('\n');
  console.log(chalk.green('Starting Stream!'));
  console.log('\n');

  stream(path, config);

  // TODO: Make a better wait / restart
  // TODO: Make the next gif in the background
  const wait = () => {
    setTimeout(() => {
      wait();
    }, 500);
  };
  wait();
}