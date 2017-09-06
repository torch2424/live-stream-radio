# Install/Compile FFMPEG
# if master is broken, try 3.2.4
# wget http://ffmpeg.org/releases/ffmpeg-3.2.4.tar.bz2
# tar xvjf ffmpeg-3.2.4.tar.bz2
git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg
cd ffmpeg
./configure --enable-shared --enable-gpl --enable-nonfree \
--enable-pthreads --enable-postproc --enable-libtheora \
--enable-version3 --enable-libx264 --disable-stripping \
--disable-encoder=libschroedinger --enable-librtmp \
--enable-openssl --enable-gnutls --enable-avfilter \
--enable-libfreetype --disable-decoder=amrnb --disable-vda \
--enable-fontconfig --disable-mips32r2 --disable-mipsdspr2 \
--disable-htmlpages --disable-podpages --disable-altivec \
--enable-libass --enable-omx --enable-omx-rpi --enable-libfdk-aac
make -j 4
sudo make install

# Go back to the repo
cd ..
