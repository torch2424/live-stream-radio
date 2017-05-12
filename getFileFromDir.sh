#/bin/bash

# Function to get random file from a directory
if [ "$#" -ne 1 ]; then
  echo "getFileFromDir.sh: Bash Script to return a random file from a directory"
  echo " "
  echo "USAGE: ./getFileFromDir.sh [Directory path]"
else
  ranfile=$( ls "$1" | sort --random-sort | tail -1 )
  echo "$1/$ranfile"
fi
