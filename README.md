# piStreamRadio

**Example Stream: "Galaxy Noise Radio". Click the image to check out the stream!**

[![Galaxy Noise Radio Live Stream link](https://files.aaronthedev.com/$/ugbbg)](https://www.youtube.com/channel/UCLkeIxbDJ8-kH7B9qJkyxQg/live)

(Last Tested 9/5/15 on a fresh install of Raspbian Stretch Lite, version August 2017)

Scripts for piStreamRadio, a 24/7 live streaming raspberry pi. This will allows for live streaming a video of music, playing over a gif, with the music information. Music and gifs are chosen from their respective folders in the radioFiles directory. Which comes included with some songs and gifs to get up and running quickly!

[This wouldn't have been possible without the initial help of this guide posted on reddit. Shoutout to sikilikis!](https://www.reddit.com/r/raspberry_pi/comments/61ntji/247_youtube_music_live_stream_and_how_you_can/)

# Getting Started (Installation)

First things first, [install Raspbian](https://www.raspberrypi.org/downloads/raspbian/) (Desktop and Lite should work):

Then, clone the repo:

```
git clone https://github.com/torch2424/piStreamRadio.git
```

Next, install the dependencies.

````
cd piStreamRadio
./installDeps.sh
````

Then you probably want to edit your `config.sh` file to provide your Stream key and url (Default URL is for youtube).

````
cd radioFiles
cp config.example.sh config.sh
vim config.sh # Add your STREAM_KEY inside of here
````

Lastly, start the stream! 🎶

````
./startStream.sh
````

And then sit back, relax, and vibe to your awesome radio! 🎵 📻 📻 📻 🎵 Gifs and Music and be removed and added from the `radioFiles/` directory, in their respective directories. Be cautious removing while streaming however, as this could lead to errors while the video is encoding.

# Adding Content to the Stream

Music files can be found under [radioFiles/music](./radioFiles/music). `.mp3` files may be added / removed here, and will be randomly played on your stream.

Gif files can be found under [radioFiles/gifs](./radioFiles/gifs). `.gif` files may be added / removed here, and will be randomly played on your stream.

Interlude files can be found under [radioFiles/interludes](./radioFiles/interludes). `.mp3` files may be added / removed here, and will be randomly played on your stream. Interludes should be used for little radio breaks, or maybe you giving a shout out to the radio station. This is simply for fun, and can give a more "radio" feel

Font files can be found under [radioFiles/fonts](./radioFiles/fonts). `.ttf` files may be added / removed here, and will be used as the onscreen text of your stream.

**Additional Notes On Stream Content:**
* Content on the stream will only be updated after a new song is loaded and played.

# Tips

* I'd suggest using a lightweight file server like [Droppy](https://github.com/silverwind/droppy) to allow easy access to your stream files. Also, Droppy will let you edit the config.sh file on the server itself!

# Additional Info

FFmpeg can be compiled and installed manually using [the additional scripts](./additionalScripts). However, it may literally take about 30-50 minutes if compiled on a raspberry pi 2. A built version of FFmpeg, its source, and its LICENSE is included in the project to improve install times, and avoid errors in FFmpeg installation.

This Project is compatible with both [Raspbian Desktop, and Raspbian Lite](https://www.raspberrypi.org/downloads/raspbian/). Though, in theory, messing with the `installDeps.sh` you could possible get this working on any Debian based Distro, such as Ubuntu, or Debian itself. You can use the [original reddit post on the process](https://www.reddit.com/r/raspberry_pi/comments/61ntji/247_youtube_music_live_stream_and_how_you_can/) as a guide if you desire to do this. I may add a branch for installing on Ubuntu in the future.

# Contributing

Feel free to fork the project, open up a PR, and give any contributions! I'd suggest opening an issue first however, just so everyone is aware and can discuss the proposed changes.

# LICENSE

LICENSE under [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/)

This software uses code of [FFmpeg](http://ffmpeg.org) licensed under the [LGPLv2.1](http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html) and its source can be downloaded [here](./deps/ffmpeg).

As such, this software tries to respect the LGPLv2 License as close as possible to respect FFmpeg and its authors. Huge shoutout to them for building such an awesome and crazy tool!
