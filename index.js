#!/usr/bin/env node

// Parse our input
const argv = require('minimist')(process.argv.slice(2), {
  string: [
    "generate"
  ],
  alias: {
    "g": ["generate"]
  }
});

// Check if we would like to generate a project
if(argv.generate) {
  // Call the generate from generator
  require('./generator/generate')(argv.generate);
}

// Start the server

// Check if we passed in a base path
const path = process.cwd();
if (argv._.length > 0) {
  path = argv[0];
}

// Call stream.js
