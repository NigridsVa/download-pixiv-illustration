import * as fs from "fs";

import PixivApp from "pixiv-app-api";
import { PixivIllust } from "pixiv-app-api/dist/PixivTypes";

import request from "request";

type ProgramOptions = {
  [key: string]: string;
};

function downloadIllustrationImages(pixivIllustration: PixivIllust): void {
  const { title, user } = pixivIllustration;

  const path = `${user.name} (${user.id})/${title}`;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
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

    console.log(`Downloading image ${url}`);

    request({
      url: url.toString(),
      headers: {
        Referer: "http://www.pixiv.net/"
      }
    }).pipe(fs.createWriteStream(`${path}/${filename}`));
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

  const illustrations: PixivIllust[] = [];

  for (let i = 0; i < illustrationIds.length; ++i) {
    try {
      illustrations.push(
        (await pixivClient.illustDetail(illustrationIds[i])).illust
      );
    } catch (err) {
      console.log(
        "Failed to retrieve data for illustration [%d]",
        illustrationIds[i],
        err
      );
    }
  }

  illustrations.forEach(illustration =>
    downloadIllustrationImages(illustration)
  );
}
