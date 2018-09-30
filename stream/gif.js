const ffmpeg = require('fluent-ffmpeg');
const ffmpegError = require('./error.js').ffmpegError
const imagemin = require('imagemin');
const imageminGifsicle = require('imagemin-gifsicle');

// Async function to optimize a gif using ffmpeg
// http://blog.pkh.me/p/21-high-quality-gif-with-ffmpeg.html
const getOptimizedGif = async (gifPath, config) => {

  const tempPalPath = '/tmp/live-stream-radio-gif-pal.png';
  const palAppliedGif = '/tmp/live-stream-radio-gif-with-pal.gif';

  // Create the gif pallete using ffmpeg
  await new Promise((resolve, reject) => {
    ffmpeg(gifPath)
    // Equivalent to -vf
    // This sets the fps, and tells to output a gif palette
      .videoFilter(`fps=${config.video_fps},palettegen=stats_mode=diff`)
      .outputOptions([
        // Override any existing file
        `-y`
      ])
      .on('end', resolve)
      .on('error', ffmpegError(reject))
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
        // Set the fps
        `fps=${config.video_fps}` +
        // Scale the gif
        `,scale=w=${config.max_gif_size}:h=${config.max_gif_size}` + 
        // Maintain the aspect ratio from the previous scale, and decrease whichever breaks it
        `:force_original_aspect_ratio=decrease` + 
        // Other cool gif optimization stuff, see linked blog post
        `:flags=lanczos` + 
        ` [x]; [x][1:v] paletteuse=dither=sierra2_4a`
      )
      .outputOptions([
        // Set the format to gif
        `-f gif`,
        // Override any existing file
        `-y`
      ])
      .on('end', resolve)
      .on('error', ffmpegError(reject))
      .save(palAppliedGif);
  });

  // Generate the final gif with an optimized byte size
  // Using gifsicle
  const files = await imagemin([palAppliedGif], '/tmp', {
    plugins: [
      imageminGifsicle({
        optimizationLevel: 3
      })
    ]
  });

  return files[0].path;
}; 


module.exports = {
  getOptimizedGif: getOptimizedGif
};