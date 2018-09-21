#!/bin/bash

# Function to get random file from a directory
if [ "$#" -ne 1 ]; then
  echo "getFileFromDir.sh: Bash Script to return a random file from a directory"
  echo " "
  echo "USAGE: ./getFileFromDir.sh [Directory path]"
else
  # Use find instead of ls to better handle non-alphanumeric filenames.
  ranfile=$( find "$1" -mindepth 1 | sort --random-sort | tail -1 )
  echo "$ranfile"
fi
