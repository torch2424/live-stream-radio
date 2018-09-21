#!/bin/bash

# Function to get random file from a directory
if [ "$#" -ne 1 ]; then
  echo "getFileFromDir.sh: Bash Script to return a random file from a directory."
  echo "This works recursively, and will not list directories, only files"
  echo " "
  echo "USAGE: ./getFileFromDir.sh [Directory path]"
else
  # Use find instead of ls to better handle non-alphanumeric filenames.
  ranfile=$( find "$1" -mindepth 1 -type f | sort --random-sort | tail -1 )
  echo "$ranfile"
fi
