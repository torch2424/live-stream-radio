# Install/Compile FFMPEG
# if master is broken, try 3.2.4
# wget http://ffmpeg.org/releases/ffmpeg-3.2.4.tar.bz2
# tar xvjf ffmpeg-3.2.4.tar.bz2

# Also, the install path if specified using --prefix
# https://trac.ffmpeg.org/wiki/CompilationGuide/Generic#Installpath
# THen you must add it to your path: export PATH=$(pwd)/deps/ffmpeg/bin:$PATH

# Trying to compile int a single static library
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
--prefix=$(pwd)/../deps/ffmpeg \
--pkg-config-flags="--static" --libdir=/usr/local/lib --extra-version=ntd_20150128 --disable-shared --enable-static
make -j 4
sudo make install

# Go back to the repo
cd ..
