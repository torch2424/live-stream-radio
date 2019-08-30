# live-stream-radio

_formerly known as piStreamRadio._

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/torch2424)

![Galaxy Noise Radio Live Stream link](https://files.aaronthedev.com/$/zk7xg)

[CLI Usage Screenshot](./docz/assets/CLIUsage.png) 🖼️

[Documentation](https://torch2424.github.io/live-stream-radio/) 📚

`live-stream-radio` is a 24/7 live stream video radio station 📹 📻 CLI built with [Node.js](https://nodejs.org/) and powered by [FFmpeg](http://ffmpeg.org). Meaning, This will allow for live streaming a video of music, playing over a video/gif, with the music information, and other overlay items 🖼️. Music and video are chosen from their respective folders in a defined `config.json` that can be generated using the CLI. Generated projects come included with some songs and videos to get up and running quickly! Also, this project has a REST HTTP JSON Api, to allow for interfacing with your stream using a frontend 👩‍💻.

# Table of Contents

- [Getting Started](#getting-started)
- [API Frontends](#api-frontends)
- [Compatibility](#compatibility)
- [Example Assets from the `--generate` template](#example-assets-from-the---generate-template)
- [Contributing](#contributing)
- [License](#license)

# Getting Started

Please see the [Documentation](https://torch2424.github.io/live-stream-radio/) 📚 for how to get started using `live-stream-radio`. In particular, the [Installation Guide](https://torch2424.github.io/live-stream-radio/#/cli/getting-started#installation) and [CLI Usage](https://torch2424.github.io/live-stream-radio/#/cli/usage) will be the most useful to new users. 😄

# API Frontends

_For building your own API frontend, please see the [API Documentation](https://torch2424.github.io/live-stream-radio/#/api/endpoints) 📚 on API Endpoints._

Currently, there are no supported API frontends. However, Contributions are welcome! If you make a `live-stream-radio` frontend, please open an issue and so we can add the project here 😄!

# Other Notable Projects

- [lsr-wrapper](https://github.com/LSRemote/lsr-wrapper) - A Promise based wrapper around the `live-stream-radio` api.
- [live-stream-radio-cp](https://github.com/Tresmos/live-stream-radio-cp) - Simple web control panel for live-stream-radio.

# Radios built with `live-stream-radio`

Please feel free to share your radio if you are using `live-stream-radio`. Just open an issue, and we can add it to the README. 😄

# Compatibility

Currently, this should work under any OS with support for [Node](https://nodejs.org/en/) and [FFMPEG](https://www.ffmpeg.org/). Specifically in the tradition of this project being developed for Raspberry Pi, formerly as piStreamRadio , this also supports Raspbian as well.

# Example Assets from the `--generate` template

Music is by [Aviscerall](https://aviscerall.bandcamp.com/), and [Marquice Turner](https://marquiceturner.bandcamp.com/). Which is actually me (@torch2424), but I have a musical identitiy problem 😛 . The .mp4 and .webm of the rotating earth, is a [public domain video I found on Youtube](https://www.youtube.com/watch?v=uuY1RXZyUFs). The image overlay uses images from EmojiOne, in particular, their [video camera emoji](https://www.emojione.com/emoji/1f4f9), and their [radio emoji](https://www.emojione.com/emoji/1f4fb).

# Contributing

Feel free to fork the project, open up a PR, and give any contributions! I'd suggest opening an issue first however, just so everyone is aware and can discuss the proposed changes. 👍

# License

LICENSE under [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/). 🐦

This software uses code of [FFmpeg](http://ffmpeg.org) licensed under the [LGPLv2.1](http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html) and it's source can be downloaded [here](./deps/ffmpeg).

As such, this software tries to respect the LGPLv2 License as close as possible to respect FFmpeg and it's authors. Huge shoutout to them for building such an awesome and crazy tool!
