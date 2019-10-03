import * as fs from "fs";

import { PixivMobileApi, downloadAsStream } from "pixiv-client/dist";
import { Illust } from "pixiv-client/dist/mobile/illust";

type ProgramOptions = {
  [key: string]: string;
};

function downloadIllustrationImages(pixivIllustration: Illust): void {
  const { title, user } = pixivIllustration;

  const path = `${user.name} (${user.id})/${title}`;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

  pixivIllustration.meta_pages.forEach(page => {
    const url = new URL(page.image_urls.original);

    // Use the filename of the downloaded file
    const parts = url.pathname.split("/");
    const filename = parts[parts.length - 1];

    console.log(`Downloading image ${url}`);

    downloadAsStream(url.toString()).pipe(
      fs.createWriteStream(`${path}/${filename}`)
    );
  });
}

export async function run(
  illustrationIds: string[] = [],
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

  const pixivClient = await PixivMobileApi.login({ username, password });

  console.log(
    `Retrieving information for Pixiv ${illustrationIds.length} illustration(s)`
  );

  const illustrations: Illust[] = [];

  for (let i = 0; i < illustrationIds.length; ++i) {
    const response = await pixivClient.getIllustDetail(illustrationIds[i]);

    if (response.illust) {
      illustrations.push(response.illust);
    } else {
      console.log(
        "Failed to retrieve data for illustration [%d]",
        illustrationIds[i]
      );
    }
  }

  illustrations.forEach(illustration =>
    downloadIllustrationImages(illustration)
  );
}
