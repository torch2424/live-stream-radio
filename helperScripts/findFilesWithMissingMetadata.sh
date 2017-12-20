#!/bin/bash

# Helper script to find files with missing artist and song name.
# Run from base pistreamradio directory

echo " "
echo "Scanning all files in radioFiles/music/* for songs missing metadata for 'artist' or 'song title'..."
echo " "

for file in radioFiles/music/*; do

  # Get the artist and song name
  ARTIST=$(id3info "$file" | grep TPE1 | head -n 1 | perl -pe 's/.*: //g')
  SONG_NAME=$(id3info "$file" | grep TIT2 | head -n 1 | perl -pe 's/.*: //g')

  # If the artist or the song name is empty, echo the file
  if [ -z "$ARTIST" ] || [ -z "$SONG_NAME" ]; then
    echo "$file"
  fi
done
