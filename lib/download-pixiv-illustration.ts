"use strict";

import { Builder, WebDriver } from "selenium-webdriver";
import { Options, ServiceBuilder } from "selenium-webdriver/firefox";

import * as fs from "fs";
import * as request from "request";

type ProgramOptions = {
  [key: string]: object;
};

const pixivUrlPrefix = "https://www.pixiv.net/member_illust.php";
const pixivSessionCookieName = "PHPSESSID";

class PixivAuthor {
  constructor(private readonly _id: string, private readonly _name: string) {}

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }
}

class PixivImage {
  constructor(private readonly _url: URL, private readonly _filename: string) {}

  get url(): URL {
    return this._url;
  }

  get filename(): string {
    return this._filename;
  }
}

class PixivIllustration {
  private _images: PixivImage[] = [];

  constructor(
    private readonly _url: string,
    private readonly _title: string,
    private readonly _author: PixivAuthor
  ) {}

  addImage(url: URL): void {
    // Use the filename of the downloaded file
    const parts = url.pathname.split("/");
    const filename = parts[parts.length - 1];

    this._images.push(new PixivImage(url, `${this.path}/${filename}`));
  }

  get images(): PixivImage[] {
    return this._images;
  }

  get url(): string {
    return this._url;
  }

  get path(): string {
    return `${this._author.name} (${this._author.id})/${this._title}`;
  }
}

async function configureWebdriver(options: ProgramOptions): Promise<WebDriver> {
  const builder = new Builder().forBrowser("firefox");

  if (options.verbose) {
    // selenium-webdriver types are currently missing definitions for these
    // methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (builder as any).setFirefoxService(
      new ServiceBuilder().enableVerboseLogging().setStdio("inherit")
    );
  } else {
    builder.setFirefoxOptions(new Options().headless());
  }

  return builder.build();
}

async function setSessionCookie(
  sessionId: string,
  webDriver: WebDriver,
  options: ProgramOptions
): Promise<void> {
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

async function extractInformation(
  url: string,
  webDriver: WebDriver
): Promise<PixivIllustration> {
  await webDriver.get(url);

  const titleElement = await webDriver.findElement({ css: "h1" });
  const title = await titleElement.getText();

  const authorIdElement = await webDriver.findElement({ css: "h2 a" });
  const authorLink = await authorIdElement.getAttribute("href");
  // This will select only the remaining part after the ? and excludes
  // 'id=' part also
  const authorId = authorLink.substring(authorLink.indexOf("?") + 4);

  const authorElement = await webDriver.findElement({ css: "h2 img" });
  const author = await authorElement.getAttribute("alt");

  const pixivIllustration = new PixivIllustration(
    url,
    title,
    new PixivAuthor(authorId, author)
  );

  // Check for multiple images belonging to this illustration
  const mangaViewerElements = await webDriver.findElements({
    css: 'div[aria-label="Preview"] > div'
  });

  // Get URL of currently shown image
  const imageLinkElement = await webDriver.findElement({ css: "figure a" });
  const imageUrl = await imageLinkElement.getAttribute("href");
  pixivIllustration.addImage(new URL(imageUrl));

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
      pixivIllustration.addImage(new URL(imageUrl.replace("_p0", `_p${i}`)));
    }
  }

  return pixivIllustration;
}

function downloadIllustrationImages(
  pixivIllustration: PixivIllustration
): void {
  if (!fs.existsSync(pixivIllustration.path)) {
    fs.mkdirSync(pixivIllustration.path, { recursive: true });
  }

  pixivIllustration.images.forEach(image => {
    console.log(`Downloading image ${image.url}`);

    request({
      url: image.url,
      headers: { Referer: pixivIllustration.url }
    }).pipe(fs.createWriteStream(image.filename));
  });
}

export async function run(
  sessionId: string,
  urls: string[] = [],
  options: ProgramOptions
): Promise<void> {
  if (!sessionId) {
    console.log("Please specify the Pixiv session id of an existing login.");
    process.exit(1);
  }

  if (urls.length === 0) {
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
