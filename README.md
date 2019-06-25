# download-pixiv-illustration

Node.js based script using Selenium to download all corresponding images
belonging to a Pixiv illustration.

## Usage

```bash
$ dpi e21424438ac9facb92ab2f50705844d9 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=75568899'

```

The downloaded pictures will be stored in the directory, where `dpi` is
currently executed from.

## Background

Before Pixiv changed their illustration pages to require JavaScript to show
the images belonging to an illustration, I used a shell script with a bit
of XPath processing to retrieve the necessary information.

At least for the retrieving part, a proper browser is needed as JavaScript
parsing with standard shell tools is no fun at all…

## Problems?

Please [file an issue].

[file an issue]: https://github.com/NigridsVa/download-pixiv-illustration/issues
