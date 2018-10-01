// Get our history service
const historyService = require('../history');

// File to return all of our /history/* routes
// This is non protected
module.exports = (stream, config, fastify) => {
  fastify.get('/history', async (request, reply) => {
    reply.type('application/json').code(200);
    return historyService.getHistory();
  });
};
