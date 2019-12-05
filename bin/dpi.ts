#!/usr/bin/env node

import program from "commander";
import * as pkg from "../package.json";

import { run } from "../lib/download-pixiv-illustration";

program
  .description("Downloads all pictures or videos for Pixiv illustrations")
  .usage("ILLUSTRATION_ID [ILLUSTRATION_ID]...")
  .option("-u, --username <username>", "Username of an existing Pixiv account.")
  .option("-p, --password <password>", "Password of an existing Pixiv account.")
  .option(
    "-v, --verbose",
    'Makes dpi verbose during the operation. Useful for debugging and seeing what\'s going on "under the hood".'
  )
  .version(pkg.version, "-V, --version")
  .parse(process.argv);

const [...illustrationIds] = program.args;

run(illustrationIds.map(id => Number.parseInt(id)), program.opts());
