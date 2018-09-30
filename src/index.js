#!/usr/bin/env node

// Parse our input
const argv = require('minimist')(process.argv.slice(2), {
  string: ['generate', 'output'],
  alias: {
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
if (argv._.length > 0) {
  path = `${process.cwd()}/${argv._[0]}`;
}

// Find if we have a config in the path
const configPath = `${path}/config.json`;
let config = undefined;
try {
  config = require(configPath);
} catch (e) {
  console.log(chalk.red('config.json was not find in project path!'));
  process.exit(1);
}

// Call stream.js
const stream = require('./stream/index.js');
stream.start(path, config, argv.output);

// TODO: Make a better wait / restart
// TODO: Make the next gif in the background
const wait = () => {
  setTimeout(() => {
    wait();
  }, 500);
};
wait();
