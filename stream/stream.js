// Get our ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const find = require('find');
const musicMetadata = require('music-metadata');

module.exports = (path, config) => {
  console.log(chalk.green('Starting Stream!'));

  stream(path, config);
}

// Recursive function to stream repeatedly
const stream = async (path, config) => {
  
  // First find a random song from the config directory
  const randomSong =  await getRandomFileWithExtensionFromPath(
    [
      /\.mp3$/
    ],
    `${path}${config.radio.audio_directory}`
  );

  console.log(chalk.blue(`Playing the audio: ${randomSong}`));

  // Get the information about the song
  const metadata = await musicMetadata.parseFile(randomSong, {native: true});

  console.log(metadata);
}

// Define our tasks here

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

  console.log(path, allFiles);

  // Return a random file
  return allFiles[Math.floor(Math.random() * allFiles.length)];
}

