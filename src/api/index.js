const chalk = require('chalk');
const fastify = require('fastify')({});

// Get our routes
const addStreamRoutes = require('./stream.js');

let currentStream;
let currentConfig;

// Export our
module.exports = {
  start: async (stream, config) => {
    // save a reference to our stream and config
    currentStream = stream;
    currentConfig = config;

    // Create our base "Hello world" route
    fastify.get('/', async (request, reply) => {
      reply.type('application/json').code(200);
      return { live_stream_radio: 'Please see documentation for endpoints and usage' };
    });

    // Implement our other routes
    addStreamRoutes(currentStream, currentConfig, fastify);

    await new Promise((resolve, reject) => {
      fastify.listen(3000, (err, address) => {
        if (err) {
          reject(err);
        }
        console.log(`${chalk.blue('API Started at:')} ${address}`);
        resolve();
      });
    });
  }
};
