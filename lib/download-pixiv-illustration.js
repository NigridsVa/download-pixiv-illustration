"use strict";

const pixivUrlPrefix = "https://www.pixiv.net/member_illust.php";
const pixivSessionCookieName = "PHPSESSID";

const { Builder } = require("selenium-webdriver");
const Firefox = require("selenium-webdriver/firefox");

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

async function getPixivIllustration(url, webDriver) {
  await webDriver.get(url);
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

  console.log(`Downloading Pixiv ${urls.length} illustration(s)`);

  for (let i = 0; i < urls.length; ++i) {
    await getPixivIllustration(urls[i], webDriver);
  }

  await webDriver.close();
}

module.exports = {
  run
};
