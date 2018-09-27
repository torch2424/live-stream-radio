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
      .videoFilter(`fps=${config.video_fps},palettegen=stats_mode=diff`)
      .outputOptions([
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
      .on('error', ffmpegError(reject))
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


module.exports = {
  getOptimizedGif: getOptimizedGif
};
