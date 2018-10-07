// List of supported file types, as regex for pathnames
// Lossless video formats decode better and perform better
// But gifs require pre-encoding
// https://superuser.com/questions/486325/lossless-universal-video-format
module.exports = {
  supportedAudioTypes: [/\.mp3$/],
  supportedVideoTypes: [/\.mp4$/, /\.webm$/, /\.gif$/]
};
