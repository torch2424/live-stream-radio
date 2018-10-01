// Function to perform all checks before performing route
const preCheck = (stream, config, fastify, request, reply) => {
  if (!stream) {
    reply.type('application/json').code(400);
    return {
      message: 'There is currently no stream'
    };
  }

  return;
};

// File to return all of our /stream/* routes
module.exports = (stream, config, fastify) => {
  // Get stream status
  fastify.get('/stream', async (request, reply) => {
    reply.type('application/json').code(200);
    return {
      isRunning: stream.isRunning()
    };
  });

  // Start the stream
  fastify.post('/stream/start', async (request, reply) => {
    preCheckResponse = preCheck(stream, config, fastify, request, reply);
    if (preCheckResponse) {
      return preCheckResponse;
    }

    if (!stream.isRunning()) {
      await stream.start();
    }

    reply.type('application/json').code(200);
    return {};
  });

  // Stop the stream
  fastify.post('/stream/stop', async (request, reply) => {
    preCheckResponse = preCheck(stream, config, fastify, request, reply);
    if (preCheckResponse) {
      return preCheckResponse;
    }

    if (stream.isRunning()) {
      await stream.stop();
    }

    reply.type('application/json').code(200);
    return {};
  });

  // Restart the stream
  fastify.post('/stream/restart', async (request, reply) => {
    preCheckResponse = preCheck(stream, config, fastify, request, reply);
    if (preCheckResponse) {
      return preCheckResponse;
    }

    if (stream.isRunning()) {
      await stream.stop();
    }

    // Wrap in a set timeout, that way it wont crash and ffmpeg can continue
    setTimeout(() => {
      stream.start();
    }, 1000);

    reply.type('application/json').code(200);
    return {};
  });
};
