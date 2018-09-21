#!/bin/bash

# Source our config files
source radioFiles/config.sh

# Introuduce the program to the user
echo " "
echo " "
echo "--------------------------------------------------"
echo "Please wait while we initialize the stream..."
echo "--------------------------------------------------"
echo " "
echo " "

# Ensure our alsa is allowing for a looped recording
sudo modprobe snd-aloop pcm_substreams=1

# Set our ffmpeg to our PATH
source exportFFmpegToPath.sh

# Allow for CTRL+C to exit
trap "exit" SIGINT

# Define Our Private Temporary Variables
STREAM_GIF_PATH="/tmp/streamGif"
CURRENT_GIF_PATH="/tmp/CURRENT_GIF.txt"
STREAM_TEXT_PATH="/tmp/stream.txt"
CURRENT_GIF=""
RANDOM_SONG=""
ARTIST=""
SONG_NAME=""

# Generate an optimized gif
CURRENT_GIF="$STREAM_GIF_PATH$(date +%s).gif"
echo "$CURRENT_GIF" > "$CURRENT_GIF_PATH"
RANDOM_GIF=$(./getFileFromDir.sh "$GIF_DIRECTORY")
./optimizeGif.sh "$RANDOM_GIF" "$CURRENT_GIF"


echo " "
echo " "
echo "--------------------------------------------------"
echo "Starting the stream..."
echo "--------------------------------------------------"
echo " "
echo " "

while true ; do

      # Source our config files (Before every play)
      source radioFiles/config.sh

      # Initialize our random song
      RANDOM_SONG=""

      # Check if we support interludes, and we should show one
      if [ "$RADIO_INTERLUDES" = true ] && [ $(expr $(date +%s) % $RADIO_INTERLUDE_INTERVAL_LENGTH) = 0 ]; then
        # Get our random song
        RANDOM_SONG=$(./getFileFromDir.sh "$INTERLUDE_DIRECTORY")

        # Create our video text from the random song
        rm $STREAM_TEXT_PATH
        echo "$INTERLUDE_TEXT" >> "$STREAM_TEXT_PATH"
      else
        # Get our random song
        RANDOM_SONG=$(./getFileFromDir.sh "$MUSIC_DIRECTORY")

        # Create our video text from the random song
        rm $STREAM_TEXT_PATH
        ARTIST=$(id3info "$RANDOM_SONG" | grep TPE1 | head -n 1 | perl -pe 's/.*: //g')
        SONG_NAME=$(id3info "$RANDOM_SONG" | grep TIT2 | head -n 1 | perl -pe 's/.*: //g')
        echo "Artist: $ARTIST" >> "$STREAM_TEXT_PATH"
        echo " " >> /tmp/stream.txt
        echo "Song: $SONG_NAME" >> "$STREAM_TEXT_PATH"
      fi

      # Create our two threads of audio playing, and the stream
      # Run the commands, and wait for either to finish
      # Also, optimize the next gif, while the stream is playing
      ( /usr/bin/mpg123 "$RANDOM_SONG" ) & \
      ( ./runFfmpeg.sh "$(cat "$CURRENT_GIF_PATH")" "$STREAM_TEXT_PATH" &
      sleep 2; \
      CURRENT_GIF="$STREAM_GIF_PATH$(date +%s).gif"; \
      echo "$CURRENT_GIF" > "$CURRENT_GIF_PATH"; \
      RANDOM_GIF=$(./getFileFromDir.sh "$GIF_DIRECTORY"); \
      ./optimizeGif.sh "$RANDOM_GIF" "$CURRENT_GIF" &
      wait ) & wait -n

      # Kill the other command if one finishes
      pkill -P $$
      # Ensure all three are completely killed (Fixes Alsa device busy)
      sudo killall ffmpeg
      sudo killall mpg123
      sudo killall generateGif

      # Loop to the next song
      echo " "
      echo " "
      echo "--------------------------------------------------"
      echo "Playing next song..."
      echo "--------------------------------------------------"
      echo " "
      echo " "
done
