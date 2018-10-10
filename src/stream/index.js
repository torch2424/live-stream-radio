const chalk = require('chalk');
const chalkLine = require('chalkline');
const stream = require('./stream.js');

// Save our current path
let currentPath = undefined;

// Save our current getConfig cuntion
let currentGetConfig = undefined;

// Save our current outputlocation
let currentOutputLocation = undefined;

// Save a reference to our ffmpegCommand
let ffmpegCommandPromise = undefined;

// Killing ffmpeg throws an expected error,
// Thus we want to make sure we don't call our error callback if so
let shouldListenForFfmpegErrors = false;

// Create our calbacks for stream end and error
const errorCallback = (err, stdout, stderr) => {
  // Check if we should respond to the error
  if (shouldListenForFfmpegErrors) {
    console.log('\n');
    chalkLine.red();
    console.log('\n');
    console.log(chalk.red('ffmpeg stderr:'), '\n\n', stderr);
    console.log(chalk.red('ffmpeg stdout:'), '\n\n', stdout);
    console.log(chalk.red('ffmpeg err:'), '\n\n', err);
    console.log('\n');
    console.log(`${chalk.red('ffmpeg encountered an error.')} 😨`);
    console.log(`Please see the stderror output above to fix the issue.`);
    console.log('\n');

    // Exit everything
    process.exit(1);
  }
};

const endCallback = () => {
  // Simply start a new stream
  console.log('\n');
  moduleExports.start();
};

// Create our exports
const moduleExports = {
  start: async (path, getConfig, outputLocation) => {
    console.log('\n');
    chalkLine.white();
    console.log('\n');
    console.log(`${chalk.green('Starting stream!')} 🛠️`);
    console.log('\n');

    if (path) {
      currentPath = path;
    }

    if (getConfig) {
      currentGetConfig = getConfig;
    }

    if (outputLocation) {
      currentOutputLocation = outputLocation;
    }

    // Get our config, this will refresh on every song
    let config = await currentGetConfig();

    //  Build our stream outputs
    if (!currentOutputLocation) {
      if (config.stream_outputs) {
        currentOutputLocation = config.stream_outputs;
      } else {
        if (!config.stream_url || !config.stream_key) {
          console.log(`${chalk.red('Missing stream_url or stream_key in your config.json !')} 😟`);
          console.log(chalk.red('Exiting...'));
          console.log('\n');
          process.exit(1);
        }

        let streamUrl = config.stream_url;
        streamUrl = streamUrl.replace('$stream_key', config.stream_key);
        currentOutputLocation = streamUrl;
      }
    }

    console.log(`${chalk.magenta('Streaming to:')} ${currentOutputLocation}`);
    console.log('\n');

    // Listen for errors again
    shouldListenForFfmpegErrors = true;

    // Start the stream again
    ffmpegCommandPromise = stream(currentPath, config, currentOutputLocation, endCallback, errorCallback);
    await ffmpegCommandPromise;
  },
  stop: async () => {
    console.log('\n');
    console.log(`${chalk.magenta('Stopping stream...')} ✋`);
    console.log('\n');

    shouldListenForFfmpegErrors = false;
    if (ffmpegCommandPromise) {
      // Get our command, its pid, and kill it.
      const ffmpegCommand = await ffmpegCommandPromise;
      const ffmpegCommandPid = ffmpegCommand.ffmpegProc.pid;
      ffmpegCommand.kill();
      ffmpegCommandPromise = undefined;

      // Wait until the pid is no longer running
      const isRunning = require('is-running');
      await new Promise(resolve => {
        const waitForPidToBeKilled = () => {
          if (isRunning(ffmpegCommandPid)) {
            setTimeout(() => {
              waitForPidToBeKilled();
            }, 250);
          } else {
            resolve();
          }
        };
        waitForPidToBeKilled();
      });
    }

    console.log('\n');
    console.log(`${chalk.red('Stream stopped!')} 😃`);
    console.log('\n');
  },
  isRunning: () => {
    return shouldListenForFfmpegErrors;
  }
};

// Finally our exports
module.exports = moduleExports;
