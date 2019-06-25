"use strict";

async function run(urls = []) {
  if (urls.length == 0) {
    console.log("Please specify at least one URL.");
    process.exit(1);
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
