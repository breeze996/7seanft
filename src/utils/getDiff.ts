import compareImages from 'resemblejs/compareImages'

export async function getDiff(files: string[], file: Buffer) {
  const options = {
    output: {
      largeImageThreshold: 1200,
      useCrossOrigin: false,
      outputDiff: true,
      boundingBox: {
        left: 35,
        top: 35,
        right: 255,
        bottom: 255,
      },
    },
    scaleToSameSize: true,
  }

  return (await Promise.all(files.map((file1) => compareImages(Buffer.from(file1, 'base64'), file, options)))).map(
    (item) => item.rawMisMatchPercentage
  )
}
