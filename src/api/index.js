const chalk = require('chalk');
const fastify = require('fastify')({});

// Get our routes
const addStreamRoutes = require('./stream.js');
const addConfigRoutes = require('./config.js');
const addLibraryRoutes = require('./library.js');

let currentStream;
let currentConfig;

// Export our
module.exports = {
  start: async (path, config, stream) => {
    // save a reference to our stream and config
    currentStream = stream;
    currentConfig = config;

    // Create our base "Hello world" route
    fastify.get('/', async (request, reply) => {
      reply.type('application/json').code(200);
      return { live_stream_radio: 'Please see documentation for endpoints and usage' };
    });

    // Implement our other routes
    addStreamRoutes(fastify, path, currentStream, currentConfig);
    addConfigRoutes(fastify, path, currentStream, currentConfig);
    addLibraryRoutes(fastify, path, currentStream, currentConfig);

    await new Promise((resolve, reject) => {
      fastify.listen(currentConfig.api.port, currentConfig.api.host, (err, address) => {
        if (err) {
          reject(err);
        }
        console.log('\n');
        console.log(`${chalk.blue('API Started at:')} ${address}`);
        resolve();
      });
    });
  }
};
