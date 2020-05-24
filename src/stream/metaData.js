const find = require('find');
const musicMetadata = require('music-metadata');

// Async Function to get a random file from a path

const getMetaData = async (extensions, path) => {
  // Find al of our files with the extensions

  let allFiles = [];

  extensions.forEach(extension => {
    allFiles = [...allFiles, ...find.fileSync(extension, path)];
  });
  let metaData = [];

  allFiles.forEach(audioFile => {
    let meta = musicMetadata.parseFile(audioFile, { duration: true });

    metaData = [...metaData, meta];
  });
  return await Promise.all(metaData);
};

module.exports = {
  getMetaData: getMetaData
};
