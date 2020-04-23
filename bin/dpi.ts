#!/usr/bin/env node

import program from "commander";
import * as pkg from "../package.json";

import { run } from "../lib/download-pixiv-illustration";

program
  .description("Downloads all pictures or videos for Pixiv illustrations")
  .usage(
    "ILLUSTRATION_ID|ILLUSTRATION_URL [ILLUSTRATION_ID|ILLUSTRATION_URL]..."
  )
  .option("-u, --username <username>", "Username of an existing Pixiv account.")
  .option("-p, --password <password>", "Password of an existing Pixiv account.")
  .option(
    "-v, --verbose",
    'Makes dpi verbose during the operation. Useful for debugging and seeing what\'s going on "under the hood".'
  )
  .version(pkg.version, "-V, --version")
  .parse(process.argv);

run(
  program.args.map((arg) => {
    let illustrationId = arg;

    // Check if it is a URL
    try {
      const urlPathParts = new URL(arg).pathname.split("/");
      illustrationId = urlPathParts[urlPathParts.length - 1];
    } catch (err) {
      // No URL so try to parse as illustration id
    }
    return Number.parseInt(illustrationId);
  }),
  program.opts()
);
