#/bin/bash

# Scripts must be run from base piStreamRadio/ Directory ! ! !

# Install/Compile FFMPEG
# if master is broken, try 3.2.4
# wget http://ffmpeg.org/releases/ffmpeg-3.2.4.tar.bz2
# tar xvjf ffmpeg-3.2.4.tar.bz2

# Also, the install path if specified using --prefix
# https://trac.ffmpeg.org/wiki/CompilationGuide/Generic#Installpath
# THen you must add it to your path: export PATH=$(pwd)/deps/ffmpeg/bin:$PATH

# Trying to compile int a single static library
# Last line to make ffmpeg a static binary, making it portable for the project
# https://video.stackexchange.com/questions/14717/how-to-compile-ffmpeg-with-libfdkaac-into-a-single-static-binary

rm -rf ffmpeg
git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg
cd ffmpeg
./configure --enable-gpl --enable-nonfree \
--enable-pthreads --enable-postproc --enable-libtheora \
--enable-version3 --enable-libx264 --disable-stripping \
--disable-encoder=libschroedinger --enable-librtmp \
--enable-openssl --enable-gnutls --enable-avfilter \
--enable-libfreetype --disable-decoder=amrnb --disable-vda \
--enable-fontconfig --disable-mips32r2 --disable-mipsdspr2 \
--disable-htmlpages --disable-podpages --disable-altivec \
--enable-libass --enable-omx --enable-omx-rpi --enable-libfdk-aac \
--prefix=$(pwd)/deps/ffmpeg \
--pkg-config-flags="--static" --libdir=/usr/local/lib --extra-version=ntd_20150128 --disable-shared --enable-static
make -j 4
sudo make install

# Multiline comment, this is how ffmpeg output should look
: `
ffmpeg version N-87246-g260ea7a7b3-ntd_20150128 Copyright (c) 2000-2017 the FFmpeg developers
  built with gcc 6.3.0 (Raspbian 6.3.0-18+rpi1) 20170516
  configuration: --enable-gpl --enable-nonfree --enable-pthreads --enable-postproc --enable-libtheora --enable-version3 --enable-libx264 --disable-stripping --disable-encoder=libschroedinger --enable-librtmp --enable-openssl --enable-gnutls --enable-avfilter --enable-libfreetype --disable-decoder=amrnb --disable-vda --enable-fontconfig --disable-mips32r2 --disable-mipsdspr2 --disable-htmlpages --disable-podpages --disable-altivec --enable-libass --enable-omx --enable-omx-rpi --enable-libfdk-aac --prefix=/home/pi/piStreamRadio/additionalScripts/ffmpeg/../deps/ffmpeg --pkg-config-flags=--static --libdir=/usr/local/lib --extra-version=ntd_20150128 --disable-shared --enable-static
  libavutil      55. 74.100 / 55. 74.100
  libavcodec     57.105.100 / 57.105.100
  libavformat    57. 81.100 / 57. 81.100
  libavdevice    57.  8.100 / 57.  8.100
  libavfilter     6.104.100 /  6.104.100
  libswscale      4.  7.103 /  4.  7.103
  libswresample   2.  8.100 /  2.  8.100
  libpostproc    54.  6.100 / 54.  6.100
Hyper fast Audio and Video encoder
usage: ffmpeg [options] [[infile options] -i infile]... {[outfile options] outfile}...
`

# Go back to the repo
cd ..
