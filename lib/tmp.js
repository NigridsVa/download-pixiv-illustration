// Issue a click on the image to load the other images
await imageLinkElement.click();

while (true) {
  // Get URL of all currently shown images
  const imageLinkElements = await webDriver.findElements({
    css: "figure a"
  });

  // First image is always there
  if (imageLinkElements.length == 1) {
    // Wait a bit for the images to load
    await promise.delayed(2000);
  } else {
    for (let i = 0; i < imageLinkElements.length; ++i) {
      const imageUrl = await imageLinkElements[i].getAttribute("href");
      pixivIllustration.images.push(imageUrl);
    }

    break;
  }
}
