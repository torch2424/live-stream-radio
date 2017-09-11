#/bin/bash

# Helper script to find files with missing artist and song name.
# Run from base pistreamradio directory

echo " "
echo "Scanning all files in radioFiles/music/*, to show their artist and song title"
echo " "

for file in radioFiles/music/*; do

  # Get the artist and song name
  ARTIST=$(id3info "$file" | grep TPE1 | head -n 1 | perl -pe 's/.*: //g')
  SONG_NAME=$(id3info "$file" | grep TIT2 | head -n 1 | perl -pe 's/.*: //g')

  # If the artist or the song name is empty, echo the file
  echo "File: $file, Artist: $ARTIST, Song Title: $SONG_NAME"
done
