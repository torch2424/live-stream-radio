const find = require('find');
const musicMetadata = require('music-metadata');

const supportedFileTypes = require('../supportedFileTypes');

// Cache some values
let allAudio = undefined;
let allAudioWithMetadata = undefined;

const getAllAudio = async (path, config) => {
  // Find al of our files with the extensions
  let allFiles = [];
  supportedFileTypes.supportedAudioTypes.forEach(extension => {
    allFiles = [...allFiles, ...find.fileSync(extension, `${path}${config.radio.audio_directory}`)];
  });

  return allFiles;
};

const getAllAudioWithMetadata = async (path, config) => {
  const audioFiles = await getAllAudio(path, config);

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
module.exports = (fastify, path, stream, config) => {
  fastify.get('/radio/audio', async (request, reply) => {
    reply.type('application/json').code(200);

    if (!allAudio) {
      allAudio = await getAllAudio(path, config);
    }

    return {
      audio: allAudio
    };
  });

  fastify.get('/radio/audio/metadata', async (request, reply) => {
    reply.type('application/json').code(200);

    if (!allAudioWithMetadata) {
      allAudioWithMetadata = await getAllAudioWithMetadata(path, config);
    }

    return {
      audioWithMetadata: allAudioWithMetadata
    };
  });
};
