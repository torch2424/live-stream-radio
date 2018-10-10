const find = require('find');
const musicMetadata = require('music-metadata');

const authService = require('./auth');
const supportedFileTypes = require('../supportedFileTypes');

const getAllAudio = async (path, getConfig) => {
  // Find al of our files with the extensions
  let allFiles = [];
  const config = await getConfig();
  supportedFileTypes.supportedAudioTypes.forEach(extension => {
    allFiles = [...allFiles, ...find.fileSync(extension, `${path}${config.radio.audio_directory}`)];
  });

  return allFiles;
};

const getAllAudioWithMetadata = async (path, getConfig) => {
  const audioFiles = await getAllAudio(path, getConfig);

  const allMetadata = [];
  const metadataPromises = [];
  audioFiles.forEach(audioFile => {
    const getAudioMetadataTask = async () => {
      const metadata = await musicMetadata.parseFile(audioFile, { duration: true });
      const metadataCommon = metadata.common;
      delete metadataCommon.picture;
      allMetadata.push({
        path: audioFile,
        metadata: metadataCommon
      });
    };

    metadataPromises.push(getAudioMetadataTask());
  });

  await Promise.all(metadataPromises);
  return allMetadata;
};

// File to return all of our /radio/* routes
module.exports = (fastify, path, stream, getConfig) => {
  fastify.get(
    '/library/audio',
    authService.secureRouteHandler(getConfig, async (request, reply) => {
      let response;
      if (request.query.include_metadata !== undefined) {
        response = await getAllAudioWithMetadata(path, getConfig);
      } else {
        response = await getAllAudio(path, getConfig);
      }

      reply.type('application/json').code(200);
      return {
        audio: response
      };
    })
  );
};
