#!/usr/bin/env node

const { NodeMediaServer } = require('node-media-server');

let nodeMediaServer = undefined;

module.exports = {
  start: async (path, getConfig, outputLocation) => {
    if (path) {
      currentPath = path;
    }

    if (getConfig) {
      currentGetConfig = getConfig;
    }

    if (outputLocation) {
      currentOutputLocation = outputLocation;
    }

    // Get our config, this will refresh on every song
    let config = await currentGetConfig();

    let ffmpegPath = '/usr/local/bin/ffmpeg';
    if (config.ffmpeg_path) {
      ffmpegPath = config.ffmpeg_path;
    }

    const config = {
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30
      },
      http: {
        port: 8002,
        allow_origin: '*'
      },
      relay: {
        ffmpeg: ffmpegPath,
        tasks: [
          {
            app: 'live',
            mode: 'push',
            edge: outputLocation
          }
        ]
      }
    };

    let nodeMediaServer = new NodeMediaServer(config);

    nodeMediaServer.run();
  }
};
