// Get our ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const find = require('find');
const musicMetadata = require('music-metadata');
const imagemin = require('imagemin');
const imageminGifsicle = require('imagemin-gifsicle');

module.exports = (path, config) => {
  console.log(chalk.green('Starting Stream!'));

  stream(path, config);
}

// Recursive function to stream repeatedly
const stream = async (path, config) => {
  
  // First find a random song from the config directory
  const randomSong = await getRandomFileWithExtensionFromPath(
    [
      /\.mp3$/
    ],
    `${path}${config.radio.audio_directory}`
  );

  console.log(chalk.blue(`Playing the audio: ${randomSong}`));

  // Get the information about the song
  const metadata = await musicMetadata.parseFile(randomSong, {native: true});

  console.log(chalk.magenta(`Artist: ${metadata.common.artist}`));
  console.log(chalk.magenta(`Album: ${metadata.common.album}`));
  console.log(chalk.magenta(`Song: ${metadata.common.title}`));
  

  // Get the stream video
  let randomVideo = await getRandomFileWithExtensionFromPath(
    [
      /\.mp4$/,
      /\.gif$/,
    ],
    `${path}${config.radio.video_directory}`
  );

  // Do some optimizations to our video as we need
  let optimizedVideo;
  if (randomVideo.endsWith('.gif')) {
    // Optimize gif
    optimizedVideo = await getOptimizedGif(randomVideo, config);
  } else {
    optimizedVideo = randomVideo;
  }

  console.log(optimizedVideo);

}

// Define our tasks here

// Async Function to get a random file from a path
const getRandomFileWithExtensionFromPath = async (extensions, path) => {

  // Find al of our files with the extensions
  let allFiles = [];
  extensions.forEach(extension => {
    allFiles = [
      ...allFiles,
      ...find.fileSync(extension, path)
    ];
  });

  // Return a random file
  return allFiles[Math.floor(Math.random() * allFiles.length)];
}

// Function to handle better ffmpeg errors
const ffmpegError = (callback, err, stdout, stderr) => {
  console.log(chalk.red('ffmpeg stderr:\n'), stderr);
  callback();
}

// Async function to optimize a gif using ffmpeg
// http://blog.pkh.me/p/21-high-quality-gif-with-ffmpeg.html
const getOptimizedGif = async (gifPath, config) => {
  
  const tempPalPath = '/tmp/live-stream-radio-gif-pal.png';
  const palAppliedGif = '/tmp/live-stream-radio-gif-with-pal.gif';
  
  // Create the gif pallete using ffmpeg
  await new Promise((resolve, reject) => {
    ffmpeg(gifPath)
      // Equivalent to -vf
      .videoFilter(`fps=${config.video_fps},palettegen=stats_mode=diff`)
      .outputOptions([
        `-y`
      ])
      .on('end', resolve)
      .on('error', ffmpegError.bind(this, reject))
      .save(tempPalPath);
  });

  // Optimize the gif quality using the palette
  // Must use .input() to ensure inputs are in the right order
  // https://superuser.com/questions/1199833/ffmpeg-palettegen-spits-out-a-palette-paletteuse-cant-use
  await new Promise((resolve, reject) => {
    ffmpeg(gifPath)
      .input(tempPalPath)
      // Equivalient to -lavi or -filter_complex
      .complexFilter(
        `fps=${config.video_fps}` +
        `,scale=w=${config.max_gif_size}:h=${config.max_gif_size}` + 
        `:force_original_aspect_ratio=decrease` + 
        `:flags=lanczos` + 
        ` [x]; [x][1:v] paletteuse=dither=sierra2_4a`
      )
      
      .outputOptions([
        `-f gif`,
        `-y`
      ])
      .on('end', resolve)
      .on('error', ffmpegError.bind(this, reject))
      .save(palAppliedGif);
  });
  
  // Generate the final optimized byte size
  const files = await imagemin([palAppliedGif], '/tmp', {
    plugins: [
      imageminGifsicle({
        optimizationLevel: 3
      })
    ]
  });

  return files[0].path;
}; 

