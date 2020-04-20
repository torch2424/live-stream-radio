const audioconcat = require('audioconcat');
const find = require('find');
const fs = require('fs');

// Async Function to get a random file from a path
module.exports = (extensions, path) => {
  // Find al of our files with the extensions
  let allFiles = [];
  const finalPath = './live-stream-radio/final/finalSong.mp3';
  extensions.forEach(extension => {
    allFiles = [...allFiles, ...find.fileSync(extension, path)];
  });

  fs.unlink(finalPath, err => {
    if (err) {
      return;
    }
  });

  return new Promise((resolve, reject) => {
    audioconcat(allFiles)
      .concat(finalPath)
      .on('start', function(command) {
        console.log('ffmpeg process started:', command);
      })
      .on('error', function(err, stdout, stderr) {
        console.error('Error:', err);
        console.error('ffmpeg stderr:', stderr);
        reject(console.error('Error:', err));
      })
      .on('end', function(output) {
        console.error('Audio created in:', output);
        resolve(console.log('Finished concat of audiofiles'));
      });
  });
};
