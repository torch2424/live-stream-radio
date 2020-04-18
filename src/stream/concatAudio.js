const audioconcat = require('audioconcat');
const find = require('find');

// Async Function to get a random file from a path
module.exports = (extensions, path) => {
  // Find al of our files with the extensions
  let allFiles = [];

  extensions.forEach(extension => {
    allFiles = [...allFiles, ...find.fileSync(extension, path)];
  });

  return new Promise((resolve, reject) => {
    audioconcat(allFiles)
      .concat('./live-stream-radio/final/all.mp3')
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

  // Return a random file

  // return '/Users/Semmes/Downloads/live-stream-radio-ffmpeg-builds/live-stream-radio/final/all.mp3';
};
