#/bin/bash

if [ "$#" -ne 2 ]; then
  echo "runFfmpeg.sh: Opinionated Bash Script to encode a gif and \
  the looped alsa interface to a live stream url."
  echo " "
  echo "USAGE: ./runFfmpeg.sh [input.gif] [fileOfTextToDisplayOnVideo.txt]"
else

  # Get the passed input files
  GIF=$1
  STREAM_TEXT_PATH=$2

  # Souce our config
  source config.sh

  # Define our private variables
  # KEYINT represents the number of key frames.
  # Should be somewhere between 2 to 4.
  KEYINT=$(expr $VIDEO_FPS \* 3)

  # Run our ffmpeg command
  # Draw text on multiple lines
  # https://stackoverflow.com/questions/11138832/ffmpeg-multiple-text-in-one-command-drawtext
  ffmpeg -f alsa -ac 2 \
  -i hw:Loopback,1,0 -fflags +genpts \
  -ignore_loop 0 -r $VIDEO_FPS -i "$GIF" -s $VIDEO_RESOLUTION \
  -vf "[in]drawtext=fontfile=${VIDEO_FONT}: \
  text=:'The Loud House\, 24/7 Open Source Radio': \
  fontsize=$FONT_SIZE: \
  bordercolor=$FONT_BORDER_COLOR: borderw=1: fontcolor=$FONT_COLOR: \
  y=$FONT_TITLE_Y_POS: x=w-mod(max(t\,0)*(w+tw)/$FONT_TITLE_SCROLL_SPEED\,(w+tw)), \
  drawtext=fontfile=${VIDEO_FONT}: \
  fontsize=$FONT_SIZE: \
  fix_bounds=true: \
  bordercolor=$FONT_BORDER_COLOR: borderw=1: fontcolor=$FONT_COLOR: \
  textfile=$STREAM_TEXT_PATH: y=$FONT_MUSIC_Y_POS: x=$FONT_MUSIC_X_POS[out]" \
  -vcodec h264_omx -x264opts keyint=$KEYINT:min-keyint=$KEYINT:scenecut=-1 \
  -b:v $VIDEO_BIT_RATE -preset veryfast -pix_fmt yuv420p \
  -c:a libfdk_aac -b:a $AUDIO_BIT_RATE -bufsize 960k \
  -ar $AUDIO_SAMPLE_RATE -f flv $STREAM_URL
fi
