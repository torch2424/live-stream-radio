// Get our ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const ffmpegError = require('./error.js').ffmpegError;
const chalk = require('chalk');
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

  console.log(chalk.blue(`Playing the audio: ${randomSong}`));

  // Get the information about the song
  const metadata = await musicMetadata.parseFile(randomSong, {duration: true});

  console.log(chalk.magenta(`Artist: ${metadata.common.artist}`));
  console.log(chalk.magenta(`Album: ${metadata.common.album}`));
  console.log(chalk.magenta(`Song: ${metadata.common.title}`));
  

  // Get the stream video
  let randomVideo = await getRandomFileWithExtensionFromPath(
    [
      /\.mp4$/,
      /\.gif$/,
    ],
    `${path}${config.radio.video_directory}`
  );

  // Do some optimizations to our video as we need
  let optimizedVideo;
  if (randomVideo.endsWith('.gif')) {
    // Optimize gif
    optimizedVideo = await require('./gif.js').getOptimizedGif(randomVideo, config);
  } else {
    optimizedVideo = randomVideo;
  }

  // Let's create a nice progress bar
  // Using the song length as the 100%, as that is when the stream should end
  const progressBar = new progress.Bar();
  progressBar.start(Math.floor(metadata.format.duration), 0);
  
  // Finally, lets start streaming!
  let streamUrl = config.stream_url;
  streamUrl = streamUrl.replace('$stream_key', config.stream_key);

  ffmpeg(optimizedVideo)
    // Allow gifs to loop infitely
    .inputOptions(
      `-ignore_loop 0`
    )
    // Add our song as input
    .input(randomSong)
    // Copy over the video audio
    .audioCodec('copy')
    // Livestream, encode in realtime as audio comes in
    // https://superuser.com/questions/508560/ffmpeg-stream-a-file-with-original-playing-rate
    .inputOptions(
      `-re`
    )
    .outputOptions([
      // Add our fps
      `-r ${config.video_fps}`,
      // Define our video size
      `-s ${config.video_width}x${config.video_height}`,
      // Set format to flv (Youtube/Twitch)
      `-f flv`
    ])
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
      const seconds = (splitTimestamp[0] * 60 * 60) + (splitTimestamp[1] * 60) + splitTimestamp[2];

      // Set seconds onto progressBar
      progressBar.update(seconds);
    })
    .save(streamUrl);

  // TODO: Make a better wait / restart
  // TODO: Make the next gif in the background
  const wait = () => {
    setTimeout(() => {
      wait();
    }, 500);
  };
  wait();
}

// Finally our exports
module.exports = (path, config) => {
  console.log(chalk.green('Starting Stream!'));

  stream(path, config);
}
