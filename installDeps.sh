#!/bin/bash

# Install/Setup Dependencies for a 24/7 music live stream pi

# Taken from: https://www.reddit.com/r/raspberry_pi/comments/61ntji/247_youtube_music_live_stream_and_how_you_can/

# Update our package list
sudo apt-get update

# Install our packages
sudo apt-get install -y nano bzip2 mpg123 htop git \
gifsicle libid3-tools id3tool \
autoconf automake build-essential libass-dev \
libfreetype6-dev libtheora-dev libtool libvorbis-dev \
pkg-config texinfo zlib1g-dev libgnutls28-dev \
librtmp-dev libssl-dev libx264-dev libasound2-dev

# Install an audio decoder
wget http://ftp.us.debian.org/debian/pool/non-free/f/fdk-aac/libfdk-aac-dev_0.1.3+20140816-2_armhf.deb
wget http://ftp.us.debian.org/debian/pool/non-free/f/fdk-aac/libfdk-aac0_0.1.3+20140816-2_armhf.deb

# Install our audio decoders
sudo dpkg -i libfdk-aac0_0.1.3+20140816-2_armhf.deb
sudo dpkg -i libfdk-aac-dev_0.1.3+20140816-2_armhf.deb

# Clean up the .deb files for the decoders
rm libfdk-aac0_0.1.3+20140816-2_armhf.deb
rm libfdk-aac-dev_0.1.3+20140816-2_armhf.deb

# Copy over our required .asoundrc
cp installFiles/asoundrc ~/.asoundrc

# Do the FFmpeg *.so fix
# Not Needed as of the static ffmpeg build
# cat installFiles/ld.so.conf | sudo tee -a /etc/ld.so.conf
# sudo ldconfig

# Should be finished
echo " "
echo " "
echo "Testing FFmpeg..."
echo " "
echo " "
# Set our ffmpeg to our PATH
source exportFFmpegToPath.sh
ffmpeg

echo " "
echo "piStreamRadio is now finished installing!"
echo " "
echo "Please be sure to create a config.sh in the radioFiles/ directory."
echo "Then, you can run ./startStream.sh from the piStreamRadio directory to start streaming!"
