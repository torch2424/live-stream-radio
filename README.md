# piStreamRadio

**Example Stream: The Loud House**


[![The Loud House piStreamRadio Embed Link](http://img.youtube.com/vi/Di8tTtGWirI/0.jpg)](http://www.youtube.com/watch?v=Di8tTtGWirI)


Scripts for piStreamRadio, a 24/7 live streaming raspberry pi. This will allows for live streaming a video of music, playing over a gif, with the music information. Music and gifs are chosen from their respective folders in the radioFiles directory. Which comes included with some songs and gifs to get up and running quickly!

[First things first, this wouldn't have been possible without the initial help of this guide posted on reddit](https://www.reddit.com/r/raspberry_pi/comments/61ntji/247_youtube_music_live_stream_and_how_you_can/)

# Installing

I've provided nice bash scripts to handle nearly everything!

First, install the dependencies

````
cd piStreamRadio
./installDeps.sh
````

Then you probably want to edit you `config.sh` file to provide your Stream key and url (Default URL is for youtube).

After this, simply start the stream!

````
./startStream.sh
````

And then sit back, relax, and vibe to your awesome radio! Gifs and Music and be removed and added from the `radioFiles/` directory. Be cautious removing while streaming however, as this could lead to errors while the video is encoding.

# Tips

Coming soon!

# Contributing

Feel free to open up a PR, and give any contributions!
