#/bin/bash

# Define all of our config for the pi radio
# These default settings are laregely based on the settings that worked
# For my Raspberry Pi 2.

# Stream Title that will be displayed scrolling right to left at the top
# PLEASE BE SURE TO ESCAPE COMMAS!!!
# This is being placed into ffmpeg
STREAM_TITLE="Pi Stream Radio\, 24/7 Open Source Radio"

# The Stream Key and URL for your stream. This is set up for a Youtube
# Live stream currently. Ensure to keep your stream key private!
STREAM_KEY=""
STREAM_URL=rtmp://a.rtmp.youtube.com/live2/$STREAM_KEY

# Radio interludes that play between songs.
# set RADIO_INTERLUDES to "true" to enable this feature
# Set RADIO_INTERLUDE_INTERVAL_LENGTH to a number
#     The larger the number, the less often an interlude will be played.
#     This is Modulo'd with EPOCH time, and default is 9. Suggest between 2 - 50
# set Interlude Text to any string that should replace the Artist/song text
RADIO_INTERLUDES=true
RADIO_INTERLUDE_INTERVAL_LENGTH=9
INTERLUDE_TEXT="Please wait, music shall resume shortly..."

# Our Directories for music and gifs
MUSIC_DIRECTORY="./radioFiles/music"
GIF_DIRECTORY="./radioFiles/gifs"
INTERLUDE_DIRECTORY="./radioFiles/interludes"


# The max size the gif will be stretched to in the x or y direction
# e.g a gif of 200x156 with a max size of 350, will be scaled to 300x268
# 268 is a number I made up, but you get the point
MAX_GIF_SIZE="300"

# The Font to be displayed on the video
VIDEO_FONT="./radioFiles/fonts/Lato-Regular.ttf"

# Frames per second the video will be encoded to
VIDEO_FPS="10"

# Video Resolution:
# Some Values to try for resolution:
# https://support.google.com/youtube/answer/6375112?hl=en
# ---------------------------------------------
# 240P - 426x240
# 360P - 640x360
# 480P - 854x480
# 720P - 1280x720
# 1080P - 1920x1080
# ---------------------------------------------
VIDEO_RESOLUTION="854x480"

# Video Bit Rate. This can Really choke a pi, and can be
# found with the settled value from ./runFfmpegTest.sh
VIDEO_BIT_RATE=500k

# Audio Bit Rate and Sample Rate. Reccomend these values for an alright sound
AUDIO_BIT_RATE=128k
AUDIO_SAMPLE_RATE=44100

# Font Color, and Font Border Color that is displayed on the video
FONT_COLOR="0xFFFFFF"
FONT_BORDER_COLOR="0x000000"

# Font Size
FONT_SIZE="10"

# Font Title Position and scroll speed
FONT_TITLE_Y_POS="5"
FONT_TITLE_SCROLL_SPEED="20"

# Font Postions
FONT_MUSIC_X_POS="5"
FONT_MUSIC_Y_POS="25"
