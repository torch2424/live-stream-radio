// Get our ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const ffmpegError = require('./error.js').ffmpegError;
const chalk = require('chalk');
const find = require('find');
const musicMetadata = require('music-metadata');

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
  const metadata = await musicMetadata.parseFile(randomSong, {native: true});

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

  // Finally, lets start streaming!
  let streamUrl = config.stream_url;
  streamUrl = streamUrl.replace('$stream_key', config.stream_key);

  ffmpeg(optimizedVideo)
    .inputOptions(
      `-ignore_loop 0`
    )
    .input(randomSong)
    .audioCodec('copy')
    .inputOptions(
      `-re`
    )
    .outputOptions([
      `-r ${config.video_fps}`,
      `-s ${config.video_width}x${config.video_height}`,
      `-f flv`
    ])
    .on('end', () => {
      console.log('DONE!');
    })
    .on('error', ffmpegError())
    .save(streamUrl);

  // TODO: Make a better wait / restart
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
