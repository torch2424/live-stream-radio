#/bin/bash

# Helper script to set song file's artist and song name meta data
# Run from base pistreamradio directory


if [ $# -ne 3 ]; then
  echo "USAGE: ./helperScripts/setFileStreamMetadata.sh [filepath] [artist name in quotes] [song name in quotes]"
  echo "EXAMPLE: ./helperScripts/setFileStreamMetadata.sh radioFiles/music/song.mp3 \"pistreamradio\" \"Helper Scripts are cool\""
else
  # Remove trailing and beginning quotes ""
  ARTIST="${$1%\"}"
  ARTIST="${ARTIST#\"}"
  SONG="${$2%\"}"
  SONG="${SONG#\"}"

  # Set the artist and song to the file
  id3tool -t "$SONG" -r "$ARTIST" $0
fi
