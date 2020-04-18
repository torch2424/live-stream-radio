const find = require('find');

// Async Function to get a random file from a path
module.exports = async (extensions, path) => {
  // Find al of our files with the extensions
  let allFiles = [];
  extensions.forEach(extension => {
    allFiles = [...allFiles, ...find.fileSync(extension, path)];
  });

  // Return a random file
  return allFiles[0];
  //   return allFiles[allFiles.indexOf('/Users/Semmes/Downloads/live-stream-radio-ffmpeg-builds/live-stream-radio/audio/test.mp3')];
};
