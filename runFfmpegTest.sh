#/bin/bash

# This is a test/less intense version of ./runFfmpeg

GIF=$1

ffmpeg -f alsa -ac 2 -i hw:Loopback,1,0 -fflags +genpts \
-ignore_loop 0 -i "$GIF" \
-r 7 -vcodec h264_omx \
-preset veryfast -pix_fmt yuv420p -s 854x480 \
-c:a libfdk_aac -b:a 96k -ar 44100 \
-f flv $URL
