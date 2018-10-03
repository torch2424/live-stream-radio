// Function to verify a key
const verifyKey = async (config, request) => {
  if (!config.api.key) {
    return true;
  }

  // Array of places to store the API key
  const supportedApiKeyFields = [request.headers.authorization, request.query.api_key];

  // Also check POST request bodies
  if (request.body) {
    supportedApiKeyFields.push(request.body.api_key);
  }

  return supportedApiKeyFields.some(keyField => {
    return config.api.key === keyField;
  });
};

// Function to wrap a standard route handler
const secureRouteHandler = (config, routeHandler) => {
  return async (request, reply) => {
    const keyResponse = await verifyKey(config, request);
    if (keyResponse) {
      return await routeHandler(request, reply);
    } else {
      reply.type('application/json').code(401);
      return {
        message: 'Unauthorized: Please pass a valid API Key'
      };
    }
  };
};

// File to handle api authentication
module.exports = {
  verifyKey: verifyKey,
  secureRouteHandler: secureRouteHandler
};
