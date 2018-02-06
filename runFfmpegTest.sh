#!/bin/bash

# This is a test/less intense version of ./runFfmpeg
# This is used to find a good balance in VIDEO_FPS
# And VIDEO_BIT_RATE for the pi
if (( $# < 1 )); then
  echo "runFfmpegTest.sh: Opinionated Bash Script to encode a gif and \
  the looped alsa interface to a live stream url. Used to help \
  find a balance in fps and video bitrate for running ./runFfmpeg.sh"
  echo " "
  echo "USAGE: ./runFfmpegTest.sh [input.gif]"
  echo " "
else

  # Set our ffmpeg to our PATH
  source exportFFmpegToPath.sh

  # Get the passed Gif
  GIF=$1

  # Souce our config
  source radioFiles/config.sh

  # Run the ffmpeg encode to the stream url
  ffmpeg -f alsa -ac 2 -i hw:Loopback,1,0 -fflags +genpts \
  -ignore_loop 0 -i "$GIF" \
  -r 7 -vcodec h264_omx \
  -preset veryfast -pix_fmt yuv420p -s 854x480 \
  -c:a libfdk_aac -b:a 96k -ar 44100 \
  -f flv "$STREAM_URL"
fi
