// Require our dependencies
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

module.exports = projectName => {
  // Add a default project name if none
  if (!projectName) {
    projectName = 'live-stream-radio';
  }

  // Inform user of project creation
  console.log('🎵', chalk.green('Generating a new pi-stream-radio project in:'), chalk.blue(projectName), '🎵');

  // Create our new project directory
  const newProjectPath = `${process.cwd()}/${projectName}`;
  console.log('📁', chalk.magenta(`Creating a directory at ${newProjectPath} ...`));
  fs.mkdirSync(newProjectPath);

  // Fill the project diretory with the template
  createDirectoryContents(process.cwd(), `${__dirname}/template`, projectName);

  // Rewrite all ./ to / in the config if running on windows
  if (process.platform == 'win32') {
    windowsChangePaths(process.cwd(), projectName);
  }

  console.log(chalk.green(`Project created at: ${newProjectPath} !`), '🎉');
};

// Function to generate out or template project
// https://medium.com/northcoders/creating-a-project-generator-with-node-29e13b3cd309
function createDirectoryContents(currentPath, templatePath, newProjectPath) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
    if (!file) {
      return;
    }

    const origFilePath = `${templatePath}/${file}`;

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    const writePath = `${currentPath}/${newProjectPath}/${file}`;

    if (stats.isFile()) {
      console.log('📝', chalk.magenta(`Copying file to ${writePath} ...`));
      fs.copySync(origFilePath, writePath);
    } else if (stats.isDirectory()) {
      console.log('📁', chalk.magenta(`Creating a directory at ${writePath} ...`));
      fs.mkdirSync(writePath);

      // recursive call
      createDirectoryContents(currentPath, `${templatePath}/${file}`, `${newProjectPath}/${file}`);
    }
  });
}

// Function to rewrite paths for windows os
function windowsChangePaths(currentPath, newProjectPath) {
  var configPath = path.join(currentPath, newProjectPath, 'config.json');
  var configContent = fs.readFileSync(configPath, 'utf-8');

  var rewrittenConfig = configContent.replace(/\.\//g, '/');

  fs.writeFileSync(configPath, rewrittenConfig);
  console.log('Successfully rewritten config.json');
}
