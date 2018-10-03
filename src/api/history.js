// Get our history service
const historyService = require('../history.service');
const authService = require('./auth');

// File to return all of our /history/* routes
// This is non protected
module.exports = (fastify, path, stream, config) => {
  fastify.get(
    '/history',
    authService.secureRouteHandler(config, async (request, reply) => {
      reply.type('application/json').code(200);
      return {
        history: historyService.getHistory()
      };
    })
  );
};
