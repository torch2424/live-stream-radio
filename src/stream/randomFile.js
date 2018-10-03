const find = require('find');

// Async Function to get a random file from a path
module.exports = async (extensions, path) => {
  // Find al of our files with the extensions
  let allFiles = [];
  extensions.forEach(extension => {
    allFiles = [...allFiles, ...find.fileSync(extension, path)];
  });

  // Return a random file
  return allFiles[Math.floor(Math.random() * allFiles.length)];
};
