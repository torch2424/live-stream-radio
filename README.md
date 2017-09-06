# piStreamRadio

**Example Stream: "Galaxy Noise Radio". Click the image to check out the stream!**

[![Galaxy Noise Radio Live Stream link](https://files.aaronthedev.com/$/ugbbg)](https://www.youtube.com/channel/UCLkeIxbDJ8-kH7B9qJkyxQg/live)

Scripts for piStreamRadio, a 24/7 live streaming raspberry pi. This will allows for live streaming a video of music, playing over a gif, with the music information. Music and gifs are chosen from their respective folders in the radioFiles directory. Which comes included with some songs and gifs to get up and running quickly!

[This wouldn't have been possible without the initial help of this guide posted on reddit. Shoutout to sikilikis!](https://www.reddit.com/r/raspberry_pi/comments/61ntji/247_youtube_music_live_stream_and_how_you_can/)

# Installing

I've provided nice bash scripts to handle nearly everything!

First, install the dependencies. Please note, you'll be doing some craziness like compiling ffmpeg, so it may literally take about 30-50 minutes if run on a raspberry pi 2.

````
cd piStreamRadio
./installDeps.sh
````

Then you probably want to edit your `config.sh` file to provide your Stream key and url (Default URL is for youtube).

````
cd radioFiles
cp config.example.sh config.sh
````

You can now edit the `config.sh` file. After this, simply start the stream!

````
./startStream.sh
````

And then sit back, relax, and vibe to your awesome radio! Gifs and Music and be removed and added from the `radioFiles/` directory, in their respective directories. Be cautious removing while streaming however, as this could lead to errors while the video is encoding.

# Tips

Coming soon!

# Contributing

Feel free to fork the project, open up a PR, and give any contributions! I'd suggest opening an issue first however, just so everyone is aware and can discuss the proposed changes.

# LICENSE

LICENSE under [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/)

This software uses code of [FFmpeg](http://ffmpeg.org) licensed under the [LGPLv2.1](http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html) and its source can be downloaded [here](./deps/ffmpeg)
