#/bin/bash

# Define all of our config for the pi radio
# These default settings are laregely based on the settings that worked
# For my Raspberry Pi 2.

# Our Directories for music and gifs
MUSIC_DIRECTORY="./radioFiles/music"
GIF_DIRECTORY="./radioFiles/gifs"

# The Font to be displayed on the video
VIDEO_FONT="./radioFiles/fonts/Lato-Regular.ttf"

# Frames per second the video will be encoded to
VIDEO_FPS="10"

# The max size the gif will be stretched to in the x or y direction
# e.g a gif of 200x156 with a max size of 350, will be scaled to 300x268
# 268 is a number I made up, but you get the point
MAX_GIF_SIZE="300"

# The Stream Key and URL for your stream. This is set up for a Youtube
# Live stream currently
STREAM_KEY=""
STREAM_URL=rtmp://a.rtmp.youtube.com/live2/$STREAM_KEY
