#/bin/bash

# Helper script to set song file's artist and song name meta data
# Run from base pistreamradio directory


if [ $# -ne 3 ]; then
  echo "Helper script to set song file's artist and song title meta data"
  echo " "
  echo "USAGE: ./helperScripts/setFileStreamMetadata.sh [filepath] [artist name in quotes] [song title in quotes]"
  echo "EXAMPLE: ./helperScripts/setFileStreamMetadata.sh radioFiles/music/song.mp3 \"pistreamradio\" \"Helper Scripts are cool\""
else
  FILE=$1
  ARTIST=$2
  SONG=$3

  # Set the artist and song to the file
  id3tool -t "$SONG" -r "$ARTIST" $FILE
fi
