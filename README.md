# download-pixiv-illustration

Node.js based script using [pixiv-app-api] to download all corresponding images
belonging to a private Pixiv illustration. Downloading Ugoira is also supported
and uses [ffmpeg] to encode the file int an MJPEG stream put into a Matroska
container file.

[![Build Status](https://travis-ci.com/NigridsVa/download-pixiv-illustration.svg?branch=master)](https://travis-ci.com/NigridsVa/download-pixiv-illustration)

## Usage

```bash
$ dpi --username pixivUser --password pixivPassword 75609833
Preparing Pixiv session
Retrieving information for Pixiv 1 illustration(s)
Downloading image https://i.pximg.net/img-original/img/2019/07/08/00/45/05/75609833_p0.jpg
Downloading image https://i.pximg.net/img-original/img/2019/07/08/00/45/05/75609833_p1.jpg
Downloading image https://i.pximg.net/img-original/img/2019/07/08/00/45/05/75609833_p2.jpg
Downloading image https://i.pximg.net/img-original/img/2019/07/08/00/45/05/75609833_p3.jpg

$ ls -1 空鯨\ \(375067\)/カムベアスにボコられるゼロ/*.jpg
空鯨 (375067)/カムベアスにボコられるゼロ/75609833_p0.jpg
空鯨 (375067)/カムベアスにボコられるゼロ/75609833_p1.jpg
空鯨 (375067)/カムベアスにボコられるゼロ/75609833_p2.jpg
空鯨 (375067)/カムベアスにボコられるゼロ/75609833_p3.jpg
```

The downloaded pictures will be stored in a directory hierarchy
(author/illustration_name) using the current working directory.

## Options

    -v, --verbose  Makes dpi verbose during the operation. Useful for debugging
                   and seeing what's going on "under the hood".

## Background

Before Pixiv changed their illustration pages to require JavaScript to show
the images belonging to an illustration, I used a shell script with a bit
of XPath processing to retrieve the necessary information.

At least for the retrieving part, a proper browser is needed as JavaScript
parsing with standard shell tools is no fun at all…

I got a tip that there is actually an API provided by Pixiv, which makes the
gathering and downloading of the respective data pretty straightforward…

## Problems?

Please [file an issue].

[pixiv-app-api]: https://github.com/akameco/pixiv-app-api
[ffmpeg]: https://ffmpeg.org/
[file an issue]: https://github.com/NigridsVa/download-pixiv-illustration/issues
