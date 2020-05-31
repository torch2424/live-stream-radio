#!/usr/bin/env node

// Parse our input
const argv = require('minimist')(process.argv.slice(2), {
  string: ['help', 'generate', 'output', 'start'],
  alias: {
    h: ['help'],
    v: ['version'],
    g: ['generate'],
    o: ['output'],
    s: ['start']
  }
});

// Check if we should print our usage
if ((Object.keys(argv).length === 1 && argv._.length <= 0) || argv.help !== undefined) {
  const chalk = require('chalk');
  const pkg = require('../package.json');

  console.log(`
${chalk.blue('USAGE:')} ${chalk.yellow(pkg.name)}
  
  ${chalk.blue('--help, -h')} : Print this usage message.
  ${chalk.blue('--version, -v')} : Print the current version of this installation.
  ${chalk.blue('--generate, -g')} ${chalk.magenta('[Project Name/Directory]')} : Generate a new stream project,
    in a directory with the Project name.
  ${chalk.blue('--output, -o')} ${chalk.magenta('[Stream Output Location]')} : Override the 'stream_url/stream_key', 
    in the config.json, and output to the location. 
    Helpful for testing output and development.
  ${chalk.blue('--start, -s')} ${chalk.magenta('[Project Name/Directory]')} : Start the stream using the passed directory.
  ${chalk.yellow('Default:')}
  Will assume the --start flag if no flag is passed.
  E.g 
  
  ${pkg.name} [Project Name/Directory]
  Will Become:
  ${pkg.name} --start [Project Name/Directory]
  `);

  process.exit(0);
}

// Check if we would like to print the installed version
if (argv.version !== undefined) {
  const jsonPackage = require('../package.json');
  console.log(jsonPackage.version);
  process.exit(0);
}

// Check if we would like to generate a project
if (argv.generate !== undefined) {
  // Call the generate from generator
  require('./generate/generate')(argv.generate);
  process.exit(0);
}

// Start the server
const fs = require('fs');
const chalk = require('chalk');

const historyService = require('./history.service');

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
const configJsonPath = `${path}config.json`;
const configJsPath = `${path}config.js`;
let getConfig = undefined;
// First check if we have a config.js
if (fs.existsSync(configJsPath)) {
  console.log(`${chalk.green('Using the config.js at:')} ${configJsPath}`);
  const configExport = require(configJsPath);

  // Wrap get config in all of our stateful service
  getConfig = async () => {
    let config = undefined;
    try {
      config = await configExport(path, {
        history: historyService.getHistory()
      });
    } catch (e) {
      console.log(`${chalk.red('error calling the config.js!')} 😞`);
      console.log(e.message);
      process.exit(1);
    }

    return config;
  };
} else if (fs.existsSync(configJsonPath)) {
  console.log(`${chalk.magenta('Using the config.json at:')} ${configJsonPath}`);
  // Simply set our config to a function that just returns the static config.json
  getConfig = async () => {
    let configJson = undefined;
    try {
      configJson = require(configJsonPath);
    } catch (e) {
      console.log(`${chalk.red('error reading the config.json!')} 😞`);
      console.log(e.message);
      process.exit(1);
    }

    return configJson;
  };
} else {
  // Tell them could not find a config file
  console.log(`${chalk.red('Error did not find a config.json at:')} ${configJsonPath} 😞`);
  if (typeof e !== 'undefined') {
    console.log(e.message);
  }
  process.exit(1);
}

// Async task to start the radio
const startRadioTask = async () => {
  // Define our stream
  let stream = require('./stream/index.js');

  // Start the api
  const api = require('./api/index.js');
  await api.start(path, getConfig, stream);

  // Set our number of history items
  const config = await getConfig();
  historyService.setNumberOfHistoryItems(config.api.number_of_history_items);

  // Start our stream
  await stream.start(path, getConfig, argv.output);
};
startRadioTask();
