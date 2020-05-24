const authService = require('./auth');
const upath = require('upath');
const fs = require('fs-extra');
const editJsonFile = require('edit-json-file');

const getFullConfig = async path => {
  // Get current config
  let config = editJsonFile(upath.join(path, 'config.json'));

  // Return Config
  return [200, config.toObject()];
};

const getConfigByKey = async (path, key) => {
  // Get current config
  let config = editJsonFile(upath.join(path, 'config.json'));

  // Return Config by a specific key
  let configValue = config.get(key);

  // Return 200 if it has a value and 404 if it does not have a value
  if (configValue) {
    return [200, configValue];
  } else {
    return [404, null];
  }
};

const changeConfig = async (path, config, key, newValue) => {
  // Make string safe
  newValue = toSafeString(newValue);
  let currentValue = key.split('.').reduce(index, config);

  // Change config
  let configFile = editJsonFile(upath.join(path, 'config.json'));

  configFile.set(key, JSON.parse(newValue));
  configFile.save();

  return [200, { key: key, oldValue: currentValue, newValue: JSON.parse(newValue) }];
};

// Helper function to make a string safe for ffmpeg & json
const toSafeString = function(string) {
  return string;
};

module.exports = (fastify, path, stream, config) => {
  fastify.get(
    '/config',
    authService.secureRouteHandler(config, async (request, reply) => {
      // Returns full config is "key" is not set, otherwise only return the requested key
      let response;
      if (request.query.key) {
        response = await getConfigByKey(path, request.query.key);
      } else {
        response = await getFullConfig(path);
      }

      reply.type('application/json').code(response[0]);
      return {
        key: request.query.key,
        value: response[1]
      };
    })
  );

  // Change a setting
  fastify.post(
    '/config',
    authService.secureRouteHandler(config, async (request, reply) => {
      let response = await changeConfig(path, config, request.body.key, request.body.value);

      reply.type('application/json').code(response[0]);
      return {
        response: response[1]
      };
    })
  );
};
