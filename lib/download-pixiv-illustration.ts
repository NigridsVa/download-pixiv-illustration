import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import PixivApp from "pixiv-app-api";
import { PixivIllust, UgoiraMetaData } from "pixiv-app-api/dist/PixivTypes";

import request from "request";

import { Extract } from "unzipper";

import ffmpeg from "fluent-ffmpeg";

import rimraf from "rimraf";

enum PixivIllustrationType {
  ILLUSTRATION = "illust",
  ANIMATION = "ugoira"
}

type ProgramOptions = {
  [key: string]: string;
};

function downloadIllustrationImages(pixivIllustration: PixivIllust): void {
  const { title, user } = pixivIllustration;

  const downloadPath = path.join(`${user.name} (${user.id})`, title);

  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

  // Differ between illustrations having one or more images
  let images: string[] = [];

  if (pixivIllustration.pageCount === 1) {
    images.push(pixivIllustration.metaSinglePage.originalImageUrl as string);
  } else if (pixivIllustration.pageCount > 1) {
    images = pixivIllustration.metaPages.map(page => page.imageUrls.original);
  }

  images.forEach(image => {
    const url = new URL(image);

    // Use the filename of the downloaded file
    const parts = url.pathname.split("/");
    const filename = parts[parts.length - 1];

    console.log(`Downloading image ${url} to ${downloadPath}`);

    request({
      url: url.toString(),
      headers: {
        Referer: "http://www.pixiv.net/"
      }
    }).pipe(fs.createWriteStream(path.join(downloadPath, filename)));
  });
}

function downloadAnimation(
  pixivIllustration: PixivIllust,
  animationMetadata: UgoiraMetaData
): void {
  const { title, user } = pixivIllustration;

  const downloadPath = path.join(`${user.name} (${user.id})`, title);

  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

  const url = new URL(
    pixivIllustration.metaSinglePage.originalImageUrl as string
  );

  // Use the filename of the downloaded file
  const parts = url.pathname.split("/");
  const filename = parts[parts.length - 1].split(".")[0];

  // Download the ZIP file containing the frames
  const tempPath = fs.mkdtempSync(
    path.join(os.tmpdir(), pixivIllustration.id.toString())
  );

  console.log(`Downloading animation frames ${url}`);

  request({
    url: animationMetadata.ugoiraMetadata.zipUrls.medium,
    headers: {
      Referer: "http://www.pixiv.net/"
    }
  })
    .pipe(
      Extract({
        path: tempPath
      })
    )
    .on("close", () => {
      const outputFile = path.join(downloadPath, `${filename}.mkv`);

      console.log("Created animation ", outputFile);

      ffmpeg()
        .input(path.join(tempPath, "%6d.jpg"))
        .addInputOption("-start_number", "0")
        .withVideoCodec("copy")
        .saveToFile(outputFile)
        .on("close", () => rimraf.sync(tempPath));
    });
}

export async function run(
  illustrationIds: number[] = [],
  options: ProgramOptions
): Promise<void> {
  const { username, password } = options;

  if (!username || !password) {
    console.log("Please specify valid Pixiv credentials.");
    process.exit(1);
  }

  if (illustrationIds.length === 0) {
    console.log("Please specify at least one illustration identifier.");
    process.exit(2);
  }

  // exit with non-zero error code when there is an unhandled promise rejection
  process.on("unhandledRejection", err => {
    throw err;
  });

  console.log("Preparing Pixiv session");

  const pixivClient = new PixivApp();
  await pixivClient.login(username, password);

  console.log(
    `Retrieving information for Pixiv ${illustrationIds.length} illustration(s)`
  );

  for (let i = 0; i < illustrationIds.length; ++i) {
    try {
      const illustration = (await pixivClient.illustDetail(illustrationIds[i]))
        .illust;

      if (illustration.type === PixivIllustrationType.ANIMATION) {
        downloadAnimation(
          illustration,
          await pixivClient.ugoiraMetaData(illustration.id)
        );
      } else {
        downloadIllustrationImages(illustration);
      }
    } catch (err) {
      console.log(
        "Failed to retrieve data for illustration [%d]",
        illustrationIds[i],
        err
      );
    }
  }
}
