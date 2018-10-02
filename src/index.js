#!/usr/bin/env node

// Parse our input
const argv = require('minimist')(process.argv.slice(2), {
  string: ['generate', 'output', 'start'],
  alias: {
    s: ['start'],
    g: ['generate'],
    o: ['output']
  }
});

// Check if we would like to generate a project
if (argv.generate !== undefined) {
  // Call the generate from generator
  require('./generate/generate')(argv.generate);
  process.exit(0);
}

// Start the server
const chalk = require('chalk');

// Check if we passed in a base path
let path = process.cwd();
if ((argv.start && argv.start.length > 0) || argv._.length > 0) {
  path = `${process.cwd()}/${argv.start || argv._[0]}`;
}

// Add a trailing slash to out path if there isn't one
const lastPathChar = path.substr(-1);
if (lastPathChar != '/') {
  path += '/';
}

// Find if we have a config in the path
const configPath = `${path}/config.json`;
let config = undefined;
try {
  config = require(configPath);
} catch (e) {
  console.log(`${chalk.red('config.json was not find in project path!')} 😞`);
  process.exit(1);
}

// Async task to start the radio
const startRadioTask = async () => {
  // Define our stream
  let stream = require('./stream/index.js');

  // Start the api
  const api = require('./api/index.js');
  await api.start(path, config, stream);

  // Start our stream
  stream.start(path, config, argv.output);
};
startRadioTask();
