const authService = require('./auth');
const upath = require('upath');

const getFullConfig = async (path, config) => {
  // Return Config
  return [200, config];
};

const getConfigByKey = async (path, config, key) => {
  // Return Config by a specific key
  let configValue = getConfigRecursive(config, key);

  // Return 200 if it has a value and 404 if it does not have a value
  if (configValue) {
    return [200, configValue];
  } else {
    return [404, null];
  }
};

const getConfigRecursive = function(config, key) {
  // Split string object notation into array
  var keyDepths = key.split('.');

  if (keyDepths[1]) {
    // Remove first key and rerun this function
    var firstKey = keyDepths.shift();
    return getConfigRecursive(config[firstKey], keyDepths.join('.'));
  } else {
    // There are no more depths to explore, return value
    return config[keyDepths];
  }
};

module.exports = (fastify, path, stream, config) => {
  fastify.get(
    '/config',
    authService.secureRouteHandler(config, async (request, reply) => {
      // Returns full config is "key" is not set, otherwise only return the requested key
      let response;
      if (request.query.key) {
        response = await getConfigByKey(path, config, request.query.key);
      } else {
        response = await getFullConfig(path, config);
      }

      reply.type('application/json').code(response[0]);
      return {
        key: request.query.key,
        value: response[1]
      };
    })
  );
};
