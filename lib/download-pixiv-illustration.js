"use strict";

const pixivUrlPrefix = "https://www.pixiv.net/member_illust.php";

async function run(urls = []) {
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
}

module.exports = {
  run
};
