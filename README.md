# live-stream-radio

_formerly known as piStreamRadio._

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/torch2424)

**Example Stream: "Galaxy Noise Radio". Click the image to check out the stream!**

[![Galaxy Noise Radio Live Stream link](https://files.aaronthedev.com/$/ugbbg)](https://www.youtube.com/channel/UCLkeIxbDJ8-kH7B9qJkyxQg/live)

[CLI Usage Screenshot](./docz/assets/CLIUsage.png) 🖼️

[In-Depth Documentation](https://torch2424.github.io/live-stream-radio/) 📚

`live-stream-radio` is a 24/7 live stream video radio station 📹 📻 CLI built with [Node.js](https://nodejs.org/) and powered by [FFmpeg](http://ffmpeg.org). Meaning, This will allow for live streaming a video of music, playing over a video/gif, with the music information, and other overlay items 🖼️. Music and video are chosen from their respective folders in a defined `config.json` that can be generated using the CLI. Generated projects come included with some songs and videos to get up and running quickly! Also, this project has a REST HTTP JSON Api, to allow for interfacing with your stream using a frontend 👩‍💻.

# Table of Contents

- [Getting Started](#getting-started)
- [API Frontends](#api-frontends)
- [Compatibility](#compatibility)
- [Example Assets from the `--generate` template](#example-assets-from-the---generate-template)
- [Contributing](#contributing)
- [License](#license)

# Getting Started

_For a complete Installation / Usage guide, please see our [In-Depth Documentation](https://torch2424.github.io/live-stream-radio/) 📚._

1. Install the latest LTS version of [Node.js](https://nodejs.org/) (which includes npm). The reccomended way of doing this is with `nvm`. (Mac and Linux: [here](https://github.com/creationix/nvm), Windows: [here](https://github.com/coreybutler/nvm-windows)). Then run the following in your command line:

```shell
nvm install --lts
```

2. Download/Compile the latest version of [FFmpeg](http://ffmpeg.org). However, the FFmpeg build must be compiled with [libfreetype to support the `drawtext` filter](https://ffmpeg.org/ffmpeg-filters.html#drawtext). For example, on macOS with brew you can do: `brew install ffmpeg --with-freetype`. For other Operating Systems, you may find luck using [hosted static builds](https://ffmpeg.zeranoe.com/builds/), or refer to the [FFmpeg Compilation Guide](https://trac.ffmpeg.org/wiki/CompilationGuide). For Raspbian / Raspberry Pi users, feel free to use the [Raspbian Stretch FFmpeg binary](https://github.com/torch2424/piStreamRadio/tree/0b75cae32cadb21d8af07584f0cfc4b9a287c077/ffmpeg) that was previously in the repo from version `1.0.0`.

3. Globally install the `live-stream-radio` module:

```shell
npm install -g live-stream-radio
```

4. Print the Usage to ensure the module was installed correctly 🐾:

```shell
live-stream-radio --help
```

5. Generate a stream project 🛠️:

```shell
live-stream-radio --generate myStream/
```

6. Edit your `config.json`, particularly, the `stream_url` and `stream_key` attributes. **Note:** The `$stream_key` is replaced in the `stream_url` value, with the value of the `stream_key`

```shell
vim myStream/config.json
```

7. Start the stream 📹:

```shell
live-stream-radio --start myStream/
```

8. Add any content in their according directories mentioned in the `config.json`! 🎉

# API Frontends

_For building your own API frontend, please see the [In-Depth Documentation](https://torch2424.github.io/live-stream-radio/) 📚 on API Endpoints._

Currently, there are no supported API frontends. However, Contributions are welcome! If you make a `live-stream-radio` frontend, please open an issue and so we can add the project here 😄!

# Compatibility

Currently, this should work under any OS with support for [Node](https://nodejs.org/en/) and [FFMPEG](https://www.ffmpeg.org/). Specifically in the tradition of this project being developed for raspberry pi, formerly as piStreamRadio , this also supports Raspbian as well.

# Example Assets from the `--generate` template

Music is by [Aviscerall](https://aviscerall.bandcamp.com/), and [Marquice Turner](https://marquiceturner.bandcamp.com/). Which is actually me (@torch2424), but I have a musical identitiy problem 😛 . The 8 bit gif is of a game demo [Star Samurai](https://github.com/torch2424/StarSamurai), and the Driving gif is from [Code and Coffee LB](http://codeandcoffeelb.org/). The .mp4 and .webm of the rotating earth, is a [public domain video I found on Youtube](https://www.youtube.com/watch?v=uuY1RXZyUFs). The image overlay uses images from EmojiOne, in particular, their [video camera emoji](https://www.emojione.com/emoji/1f4f9), and their [radio emoji](https://www.emojione.com/emoji/1f4fb).

# Contributing

Feel free to fork the project, open up a PR, and give any contributions! I'd suggest opening an issue first however, just so everyone is aware and can discuss the proposed changes. 👍

# License

LICENSE under [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/). 🐦

This software uses code of [FFmpeg](http://ffmpeg.org) licensed under the [LGPLv2.1](http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html) and its source can be downloaded [here](./deps/ffmpeg).

As such, this software tries to respect the LGPLv2 License as close as possible to respect FFmpeg and its authors. Huge shoutout to them for building such an awesome and crazy tool!
