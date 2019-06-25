"use strict";

const pixivUrlPrefix = "https://www.pixiv.net/member_illust.php";

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

async function getPixivIllustration(url, webDriver) {
  await webDriver.get(url);
}

async function run(urls = [], options) {
  if (urls.length == 0) {
    console.log("Please specify at least one URL.");
    process.exit(1);
  }

  const erroneousUrls = urls.filter(url => !url.startsWith(pixivUrlPrefix));

  if (erroneousUrls.length > 0) {
    erroneousUrls.forEach(url =>
      console.log(`${url} is not a valid Pixiv URL`)
    );
    process.exit(2);
  }

  // exit with non-zero error code when there is an unhandled promise rejection
  process.on("unhandledRejection", err => {
    throw err;
  });

  console.log(`Downloading Pixiv ${urls.length} illustration(s)`);

  const webDriver = await configureWebdriver(options);

  for (let i = 0; i < urls.length; ++i) {
    await getPixivIllustration(urls[i], webDriver);
  }

  await webDriver.close();
}

module.exports = {
  run
};
