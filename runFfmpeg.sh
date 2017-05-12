# Define our variables
GIF="/home/pi/theLoudHouseFiles/gifs/90s 16.gif"
FONT="/home/pi/theLoudHouseFiles/font/Jet Set.ttf"
FPS=10
# Bit rate greatly chokes a pi
BIT_RATE=500k
AUDIO_BIT_RATE=128k
AUDIO_SAMPLE_RATE=44100
KEYINT=$(expr $FPS \* 3)

# Font Options
TEXT=/tmp/stream.txt
COLOR="0xFFFFFF"
BCOLOR="0x000000"
FONTSIZE="10"
FONTXPOS="5"
FONTYPOS="5"
FONTLOWYPOS="25"
SCROLLXTIME="15"

# Some resolutions to try
THREESIXTYP="640x360"
FOUREIGHTYP="854x480"

# Stream to the passed in arg if we have one
if (( $# > 2 )) || (( $# < 1 )); then
  echo "USAGE: ./runFfmpeg.sh [.gif] [OPTIONAL: Youtube Stream Key]"
  echo "Commands Passed: $#"
fi

if [ "$#" == 1 ]; then
  GIF=$1
else
  GIF=$1
  STREAM_KEY=$2
fi

echo "DEBUG: ENCODING GIF AT: $GIF"

# Run our ffmpeg command
# Draw text on multiple lines
# https://stackoverflow.com/questions/11138832/ffmpeg-multiple-text-in-one-command-drawtext
ffmpeg -f alsa -ac 2 \
-i hw:Loopback,1,0 -fflags +genpts \
-ignore_loop 0 -r $FPS -i "$GIF" -s $FOUREIGHTYP \
-vf "[in]drawtext=text=:'The Loud House\, 24/7 Open Source Radio': \
fontsize=$FONTSIZE: \
bordercolor=$BCOLOR: borderw=1: fontcolor=$COLOR: \
y=$FONTYPOS: x=w-mod(max(t\,0)*(w+tw)/$SCROLLXTIME\,(w+tw)), \
drawtext=fontfile=${FONT}: \
fontsize=$FONTSIZE: \
fix_bounds=true: \
bordercolor=$BCOLOR: borderw=1: fontcolor=$COLOR: \
textfile=$TEXT: y=$FONTLOWYPOS: x=$FONTXPOS[out]" \
-vcodec h264_omx -x264opts keyint=$KEYINT:min-keyint=$KEYINT:scenecut=-1 \
-b:v $BIT_RATE -preset veryfast -pix_fmt yuv420p \
-c:a libfdk_aac -b:a $AUDIO_BIT_RATE -bufsize 960k \
-ar $AUDIO_SAMPLE_RATE -f flv $URL
