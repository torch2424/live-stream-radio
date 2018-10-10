const chalk = require('chalk');
const fastify = require('fastify')({});

// www-form-urlencoded parser for fastify
fastify.register(require('fastify-formbody'));

// Get our routes
const addStreamRoutes = require('./stream.js');
const addConfigRoutes = require('./config.js');
const addLibraryRoutes = require('./library.js');

let currentStream;
let currentGetConfig;

// Export our
module.exports = {
  start: async (path, getConfig, stream) => {
    // save a reference to our stream and config
    currentStream = stream;
    currentGetConfig = getConfig;

    // Create our base "Hello world" route
    fastify.get('/', async (request, reply) => {
      reply.type('application/json').code(200);
      return { live_stream_radio: 'Please see documentation for endpoints and usage' };
    });

    // Implement our other routes
    addStreamRoutes(fastify, path, currentStream, currentGetConfig);
    addConfigRoutes(fastify, path, currentStream, currentGetConfig);
    addLibraryRoutes(fastify, path, currentStream, currentGetConfig);

    const config = getConfig();

    await new Promise((resolve, reject) => {
      fastify.listen(config.api.port, config.api.host, (err, address) => {
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
