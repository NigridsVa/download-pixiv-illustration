"use strict";

const pixivUrlPrefix = "https://www.pixiv.net/member_illust.php";
const pixivSessionCookieName = "PHPSESSID";

const { Builder } = require("selenium-webdriver");
const Firefox = require("selenium-webdriver/firefox");

const fs = require("fs");
const request = require("request");

class PixivImage {
  constructor(url) {
    this._url = new URL(url);

    // Use the filename of the downloaded file
    const parts = this._url.pathname.split("/");
    this._filename = parts[parts.length - 1];
  }

  get url() {
    return this._url;
  }

  get filename() {
    return this._filename;
  }
}

class PixivIllustration {
  constructor(url) {
    this._url = url;
    this._images = [];
  }

  set url(url) {
    this._url = url;
  }

  set title(title) {
    this._title = title;
  }

  get title() {
    return this._title;
  }

  set author(author) {
    this._author = author;
  }

  set images(images) {
    this._images = images;
  }

  get images() {
    return this._images;
  }

  get url() {
    return this._url;
  }
}

async function configureWebdriver(options) {
  const builder = new Builder().forBrowser("firefox");

  if (options.verbose) {
    builder.setFirefoxService(
      new Firefox.ServiceBuilder().enableVerboseLogging().setStdio("inherit")
    );
  } else {
    builder.setFirefoxOptions(new Firefox.Options().headless());
  }

  return builder.build();
}

async function setSessionCookie(sessionId, webDriver, options) {
  await webDriver.get("https://www.pixiv.net/");

  await webDriver.manage().deleteCookie(pixivSessionCookieName);

  await webDriver.manage().addCookie({
    name: pixivSessionCookieName,
    value: sessionId,
    domain: ".pixiv.net",
    httpOnly: true,
    secure: true
  });

  const cookie = await webDriver.manage().getCookie(pixivSessionCookieName);

  if (!cookie) {
    console.log("Failed to set Pixiv session cookie.");
    await webDriver.close();
    process.exit(4);
  }

  if (options.verbose) {
    console.log("Set Pixiv session cookie", cookie);
  }
}

async function extractInformation(url, webDriver) {
  const pixivIllustration = new PixivIllustration(url);

  await webDriver.get(url);

  const titleElement = await webDriver.findElement({ css: "h1" });
  pixivIllustration.title = await titleElement.getText();

  const authorElement = await webDriver.findElement({ css: "h2 img" });
  pixivIllustration.author = await authorElement.getAttribute("alt");

  // Check for multiple images belonging to this illustration
  const mangaViewerElements = await webDriver.findElements({
    css: 'div[aria-label="Preview"] > div'
  });

  // Get URL of currently shown image
  const imageLinkElement = await webDriver.findElement({ css: "figure a" });
  const imageUrl = await imageLinkElement.getAttribute("href");
  pixivIllustration.images.push(new PixivImage(imageUrl));

  if (mangaViewerElements.length > 0) {
    const content = await mangaViewerElements[0].getText();
    const slashPosition = content.indexOf("/");

    if (slashPosition === -1) {
      console.log(
        "Manga viewer format seems to have changed. It does not contain a '/' anymore."
      );
      await webDriver.close();
      process.exit(5);
    }

    const numImages = Number.parseInt(content.substring(slashPosition + 1));

    for (let i = 1; i < numImages; ++i) {
      pixivIllustration.images.push(
        new PixivImage(imageUrl.replace("_p0", `_p${i}`))
      );
    }
  }

  return pixivIllustration;
}

function downloadIllustrationImages(pixivIllustration) {
  pixivIllustration.images.forEach(image => {
    console.log(`Downloading image ${image.url}`);

    request({
      url: image.url,
      headers: { Referer: pixivIllustration.url }
    }).pipe(fs.createWriteStream(image.filename));
  });
}

async function run(sessionId, urls = [], options) {
  if (!sessionId) {
    console.log("Please specify the Pixiv session id of an existing login.");
    process.exit(1);
  }

  if (urls.length == 0) {
    console.log("Please specify at least one URL.");
    process.exit(2);
  }

  const erroneousUrls = urls.filter(url => !url.startsWith(pixivUrlPrefix));

  if (erroneousUrls.length > 0) {
    erroneousUrls.forEach(url =>
      console.log(`${url} is not a valid Pixiv URL`)
    );
    process.exit(3);
  }

  // exit with non-zero error code when there is an unhandled promise rejection
  process.on("unhandledRejection", err => {
    throw err;
  });

  const webDriver = await configureWebdriver(options);

  console.log("Preparing Pixiv session");

  await setSessionCookie(sessionId, webDriver, options);

  console.log(
    `Retrieving information for Pixiv ${urls.length} illustration(s)`
  );

  const illustrations = [];

  for (let i = 0; i < urls.length; ++i) {
    const illustration = await extractInformation(urls[i], webDriver);
    illustrations.push(illustration);
  }

  await webDriver.close();

  illustrations.forEach(illustration =>
    downloadIllustrationImages(illustration)
  );
}

module.exports = {
  run
};
