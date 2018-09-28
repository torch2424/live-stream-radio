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
  
  // First find a random song from the config directory
  const randomSong = await getRandomFileWithExtensionFromPath(
    [
      /\.mp3$/
    ],
    `${path}${config.radio.audio_directory}`
  );
  

  console.log(chalk.blue(`Playing the audio:`));
  console.log(randomSong);
  console.log('\n'); 

  // Get the stream video
  let randomVideo = await getRandomFileWithExtensionFromPath(
    [
      /\.mp4$/,
      // /\.webm$/,
      // /\.gif$/,
    ],
    `${path}${config.radio.video_directory}`
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

  // Create our command with the video as input
  let ffmpegCommand = ffmpeg(optimizedVideo);

  // Add input options depending on video type
  if (optimizedVideo.endsWith('.gif')) {
    // Allow gifs to loop infitely
    ffmpegCommand = ffmpegCommand
      .inputOptions(
      `-ignore_loop 0`
      );
  } else {
  
  }

  // Add our audio as input
  ffmpegCommand = ffmpegCommand.input(randomSong)
    // Copy over the video audio
    .audioCodec('copy')
    // Livestream, encode in realtime as audio comes in
    // https://superuser.com/questions/508560/ffmpeg-stream-a-file-with-original-playing-rate
    .inputOptions(
      `-re`
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
  ffmpegCommand.save(streamUrl);
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
