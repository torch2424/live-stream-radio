#/bin/bash

# Script to generate an optimized gif
if [ "$#" -ne 2 ]; then
  echo "optimizeGif.sh: Opinionated Bash Script to optimize a gif"
  echo " "
  echo "USAGE: ./optimizeGif.sh [input.gif] [output.gif]"
else

  # Define our variables
  GIF=$1
  OPTIMIZED_GIF_PATH=$2
  PALLET_PATH="/tmp/optimizeGifPallet.png"

  # Import our config
  source config.sh

  # Optimize the gif to be small no larger than the maxsize on the x or y
  # And use gifsicle to reduce filesize
  # See the article: http://blog.pkh.me/p/21-high-quality-gif-with-ffmpeg.html

  # Generate our gif pallete
  ffmpeg -i "$GIF" \
  -vf "fps=$VIDEO_FPS,palettegen=stats_mode=diff" \
  -y "$PALLET_PATH"

  # Use our pallete for a dope optimized gif
  ffmpeg -i "$GIF" \
  -i "$PALLET_PATH" \
  -lavfi "fps=$VIDEO_FPS,scale=w=$MAX_GIF_SIZE:h=$MAX_GIF_SIZE:force_original_aspect_ratio=decrease \
  [x]; [x][1:v] paletteuse=dither=sierra2_4a" \
  -f gif - | gifsicle --optimize=3 --delay=6 > $OPTIMIZED_GIF_PATH
fi
