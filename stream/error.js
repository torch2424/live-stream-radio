
const chalk = require('chalk');

// Function to handle better ffmpeg errors
// https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/wiki/FAQ
const ffmpegError = (callback) => {
  return (err, stdout, stderr) => {
    console.log(chalk.red('ffmpeg stderr:\n'), stderr);
    if (callback) {
      callback();
    }
  };
}

module.exports = {
  ffmpegError: ffmpegError
}

