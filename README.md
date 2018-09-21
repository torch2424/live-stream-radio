# piStreamRadio

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/torch2424)

**Example Stream: "Galaxy Noise Radio". Click the image to check out the stream!**

[![Galaxy Noise Radio Live Stream link](https://files.aaronthedev.com/$/ugbbg)](https://www.youtube.com/channel/UCLkeIxbDJ8-kH7B9qJkyxQg/live)

Scripts for piStreamRadio, a 24/7 live streaming raspberry pi. This will allows for live streaming a video of music, playing over a gif, with the music information. Music and gifs are chosen from their respective folders in the radioFiles directory. Which comes included with some songs and gifs to get up and running quickly!

[This wouldn't have been possible without the initial help of this guide posted on reddit. Shoutout to sikilikis!](https://www.reddit.com/r/raspberry_pi/comments/61ntji/247_youtube_music_live_stream_and_how_you_can/)

# Table Of Contents

* [Compatibility](#compatibility)
* [Getting Started (Installation)](#getting-started-installation)
* [Updating](#updating)
* [Adding Content to the Stream](#adding-content-to-the-stream)
  * [Music](#music)
  * [Gifs](#gifs)
  * [Interludes](#interludes)
  * [Fonts](#fonts)
* [Helper Scripts](#helper-scripts)
* [Tips](#tips)
* [Additional Info](#additional-info)
* [Contributing](#contributing)
* [LICENSE](#license)

# Compatibility

**Legend**

| Status       | Explaination                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Doesn't Work | piStreamRadio does not start or install, not usable in any way                                     |
| Runs         | piStreamRadio successfully installs and starts with minor problems (sluggish stream, sound issues) |
| Works        | piStreamRadio installs and runs as intended with at least 1x speed in ffmpeg                       |

**Testes configurations**

| Device         | OS                    | Compatibility | Last Update                        |
| -------------- | --------------------- | ------------- | ---------------------------------- |
| Raspberry Pi 0 | Raspbian              | Doesn't Work  | Sept 26th 2017 by robsd            |
| Raspberry Pi 1 |                       | ????          | Please try out and report back     |
| Raspberry Pi 2 | Raspbian Stretch Lite | Works         | Sept 6th 2017 by torch2424         |
| Raspberry Pi 3 | Raspbian Stretch Lite | Works         | Sept 9th 2017 by AndreasWebdev     |

**Add your compatibility report**
To report your compatibility, start a new Issue with your device, os and the level of compatibility.

# Getting Started (Installation)

First things first, [install Raspbian](https://www.raspberrypi.org/downloads/raspbian/) (Desktop and Lite should work):

Then, [download the latest release](https://github.com/torch2424/piStreamRadio/releases). The releases tend to be the most stable, and give the least amount of issues getting things working.

But, if you want all the latest features, and don't mind messing around with things, then feel free to clone the repo. The project is a bit large as it comes with a compiled FFmpeg for piStreamRadio:

```
git clone https://github.com/torch2424/piStreamRadio.git
```

After this, cd into the piStreamRadio directory. **PLEASE NOTE:** All scripts assume that they are run from the base piStreamRadio/ directory, and may not work if they are moved or run somewhere else. Please see the "Tips" Section for more detail

```
cd piStreamRadio
```

Next, install the dependencies. This will take a little bit of time, probably 5-10 minutes since it shall be installing some audio stuff.

````
./installDeps.sh
````

Then you probably want to edit your `config.sh` file to provide your Stream key and url (Default URL is for youtube). Copy the example, and then edit the final `config.sh`.

````
cp radioFiles/config.example.sh radioFiles/config.sh
vim radioFiles/config.sh # Add your STREAM_KEY inside of here
````

Lastly, start the stream! 🎶

````
./startStream.sh
````

And then sit back, relax, and vibe to your awesome radio! 🎵 📻 📻 📻 🎵 Gifs and Music and be removed and added from the `radioFiles/` directory, in their respective directories. Be cautious removing files while streaming however, as this could lead to errors while the video is encoding.

# Updating

Updating your stream to the latest master can sometimes have breaking changes. I will be sure to keep the Compatibility Section in the README up-to-date, with the latest tested version of Raspbian. If errors occur while updating, I suggest upgrading to the latest raspbian. For instance, [here is the guide to upgrade from Jessie to Stretch](https://www.raspberrypi.org/blog/raspbian-stretch/).

# Adding Content to the Stream

Specific directories in [radioFiles](./radioFiles) control what is shown on your stream. Please see below for the directories and what each one does. Also, please also note **files in these directories can be nested and organized in sub folders, as they are found/randomized recursively**.

### Music

Music files can be found under [radioFiles/music](./radioFiles/music). `.mp3` files may be added / removed here, and will be randomly played on your stream.

### Gifs

Gif files can be found under [radioFiles/gifs](./radioFiles/gifs). `.gif` files may be added / removed here, and will be randomly played on your stream.

### Interludes

Interlude files can be found under [radioFiles/interludes](./radioFiles/interludes). `.mp3` files may be added / removed here, and will be randomly played on your stream. Interludes should be used for little radio breaks, or maybe you giving a shout out to the radio station. This is simply for fun, and can give a more "radio" feel

### Fonts

Font files can be found under [radioFiles/fonts](./radioFiles/fonts). `.ttf` files may be added / removed here, and will be used as the onscreen text of your stream.

**Additional Notes On Stream Content:**
* Content on the stream will only be updated after a new song is loaded and played.

# Helper Scripts

In the `helperScripts/` directory, I have provided multiple scripts that can be run from the base `piStreamRadio/` directory like the following:

```
./helperScripts/findFilesWithMissingMetadata.sh
```

The goal of these scripts is to help manage piStreamRadio, such as song metadata. Please visit the [helperScripts/ Directory](./helperScripts) to view what they do, or simply run them for the Usage.

# Tips

* Just a reiteration of the install steps in more detail: All scripts assume that they are run from the base piStreamRadio/ directory, and may not work if they are moved or run somewhere else. For instance, for `./installDeps`, if you were to run it from a child directory like: `../installDeps` or from a parent directory `./piStreamRadio/installDeps`, this will not work. The scripts all assume that your current working directory is piStreamRadio/ since I do not know where you may have cloned or downloaded the source code.

* I'd suggest using a lightweight file server like [Droppy](https://github.com/silverwind/droppy) to allow easy access to your stream files. Also, Droppy will let you edit the config.sh file on the server itself! Another file server I could suggest would be [Filerun](http://www.filerun.com/), it is a lot heavier than Droppy, but offers a more robust interface, and file meta data editing!

* I create a server-side rendered website in Go for piStreamRadio at [piStreamRadio-frontend](https://github.com/torch2424/piStreamRadio-frontend). This will host a website and interface with the piStreamRadio `radioFiles/music` directory to offer a playlist to your fans! Also, has standard website things like a homepage (with an embed of your stream), and about page, and etc...

# Additional Info

FFmpeg can be compiled and installed manually using [the additional scripts](./additionalScripts). However, it may literally take about 30-50 minutes if compiled on a raspberry pi 2. A built version of FFmpeg, its source, and its LICENSE is included in the project to improve install times, and avoid errors in FFmpeg installation.

This Project is compatible with both [Raspbian Desktop, and Raspbian Lite](https://www.raspberrypi.org/downloads/raspbian/). Though, in theory, messing with the `installDeps.sh` and `exportFFmpegToPath.sh` you could possibly get this working on any Debian based Distro, such as Ubuntu, or Debian itself. You can use the [original reddit post on the process](https://www.reddit.com/r/raspberry_pi/comments/61ntji/247_youtube_music_live_stream_and_how_you_can/) as a guide if you desire to do this. I may add a branch for installing on Ubuntu in the future.

# Contributing

Feel free to fork the project, open up a PR, and give any contributions! I'd suggest opening an issue first however, just so everyone is aware and can discuss the proposed changes.

# LICENSE

LICENSE under [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/)

This software uses code of [FFmpeg](http://ffmpeg.org) licensed under the [LGPLv2.1](http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html) and its source can be downloaded [here](./deps/ffmpeg).

As such, this software tries to respect the LGPLv2 License as close as possible to respect FFmpeg and its authors. Huge shoutout to them for building such an awesome and crazy tool!
