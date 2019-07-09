# download-pixiv-illustration

Node.js based script using Selenium to download all corresponding images
belonging to a private Pixiv illustration.

## Usage

```bash
$ dpi e21424438ac9facb92ab2f50705844d9 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=75609833'
Preparing Pixiv session
Retrieving information for Pixiv 1 illustration(s)
Downloading image https://i.pximg.net/img-original/img/2019/06/27/13/06/11/75428975-993addf2a520d52c3f597c220883f897_p0.jpg
Downloading image https://i.pximg.net/img-original/img/2019/06/27/13/06/11/75428975-993addf2a520d52c3f597c220883f897_p1.jpg
Downloading image https://i.pximg.net/img-original/img/2019/06/27/13/06/11/75428975-993addf2a520d52c3f597c220883f897_p2.jpg
Downloading image https://i.pximg.net/img-original/img/2019/06/27/13/06/11/75428975-993addf2a520d52c3f597c220883f897_p3.jpg
Downloading image https://i.pximg.net/img-original/img/2019/06/27/13/06/11/75428975-993addf2a520d52c3f597c220883f897_p4.jpg
Downloading image https://i.pximg.net/img-original/img/2019/06/27/13/06/11/75428975-993addf2a520d52c3f597c220883f897_p5.jpg

$ ls *.jpg
75428975-993addf2a520d52c3f597c220883f897_p0.jpg  75428975-993addf2a520d52c3f597c220883f897_p2.jpg  75428975-993addf2a520d52c3f597c220883f897_p4.jpg
75428975-993addf2a520d52c3f597c220883f897_p1.jpg  75428975-993addf2a520d52c3f597c220883f897_p3.jpg  75428975-993addf2a520d52c3f597c220883f897_p5.jpg
```

The downloaded pictures will be stored in the directory, where `dpi` is
currently executed from.

## Options

    -v, --verbose  Makes dpi verbose during the operation. Useful for debugging
                   and seeing what's going on "under the hood".

## Background

Before Pixiv changed their illustration pages to require JavaScript to show
the images belonging to an illustration, I used a shell script with a bit
of XPath processing to retrieve the necessary information.

At least for the retrieving part, a proper browser is needed as JavaScript
parsing with standard shell tools is no fun at all…

## Problems?

Please [file an issue].

[file an issue]: https://github.com/NigridsVa/download-pixiv-illustration/issues
