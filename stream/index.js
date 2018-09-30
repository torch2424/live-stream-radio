const chalk = require('chalk');
const chalkLine = require('chalkline');
const stream = require('./stream.js');

// Save our current path
let currentPath = undefined;

// Save our current config
let currentConfig = undefined;

// Save our current outputlocation
let currentOutputLocation = undefined;

// Save a reference to our ffmpegCommand
let ffmpegCommand = undefined;

// Killing ffmpeg throws an expected error,
// Thus we want to make sure we don't call our error callback if so
let shouldListenForFfmpegErrors = false;

// Create our calbacks for stream end and error
const errorCallback = (err, stdout, stderr) => {
  // Check if we should respond to the error
  if (shouldListenForFfmpegErrors) {
    console.log(chalk.red('ffmpeg stderr:\n'), stderr);
    process.exit(1);
  }
}

const endCallback = () => {
  // Simply start a new stream
  console.log('\n');
  moduleExports.start(currentPath, currentConfig, currentOutputLocation);
}


// Create our exports
const moduleExports = {
  start: (path, config, outputLocation) => {

    console.log('\n');
    chalkLine.green();
    console.log('\n');
    console.log(chalk.green('Starting stream!'));
    console.log('\n');

    //  Build our stream url 
    if (!outputLocation) {

      if (!config.stream_url || !config.stream_key) {
        console.log(chalk.red('Missing a stream_url or a stream_key in your config.json !'));
        console.log(chalk.red('Exiting...'));
        console.log('\n');
        process.exit(1);
      }

      let streamUrl = config.stream_url;
      streamUrl = streamUrl.replace('$stream_key', config.stream_key);
      outputLocation = streamUrl;
    }

    console.log(`${chalk.magenta('Streaming to:')} ${outputLocation}`);
    console.log('\n');

    // Listen for errors again
    shouldListenForFfmpegErrors = true;

    // Start the stream again
    stream(path, config, outputLocation, endCallback, errorCallback);

    // Save our passed params for later use
    currentPath = path;
    currentConfig = config;
    currentOutputLocation = outputLocation;
  },
  stop: () => {
    console.log('\n');
    console.log(chalk.red('Stopping stream...'));
    console.log('\n');

    shouldListenForFfmpegErrors = false;
    ffmpegCommand.kill();
    ffmpegCommand = undefined;
  }
};

// Finally our exports
module.exports = moduleExports;
