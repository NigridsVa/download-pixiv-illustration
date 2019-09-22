#!/usr/bin/env node

import * as program from "commander";
import * as pkg from "../package.json";

import { run } from "../lib/download-pixiv-illustration";

program
  .description("Downloads all pictures or videos for Pixiv illustration URLs")
  .usage("SESSION-ID URL [URL]...")
  .option(
    "-v, --verbose",
    'Makes dpi verbose during the operation. Useful for debugging and seeing what\'s going on "under the hood".'
  )
  .version(pkg.version, "-V, --version")
  .parse(process.argv);

const [sessionId, ...urls] = program.args;

run(sessionId, urls, program.opts());
