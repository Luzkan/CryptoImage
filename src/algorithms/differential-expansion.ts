// -------------------------------------------------------------
// Difference expansion algorithm

function differentialExpansionEncrypt(bmp: BMP): BMP {

  const pixelPairs = bmpToPixelPairs(bmp);

  const encrypted = encrypt(pixelPairs)

  const pixelArray = pixelPairsToPixelArray(encrypted)
  return BMP.fromPixelArrayData(pixelArray, bmp.width)
}

// Co z nieparzystymi ?
function bmpToPixelPairs(bmp: BMP): number[][][] {
  const pixels = bmp.pixelsArrayData;
  const pairs = [];
  for (let i = 0; i < pixels.length; i = i + 2) {
    pairs.push(pixels.slice(i, i + 2));
  }
  return pairs;
}

function encrypt(pixelPairs: number[][][]): number[][][] {

  for (let i = 0; i < pixelPairs.length; i++) {
    const pixelA: number[] = pixelPairs[i][0];
    const pixelB: number[] = pixelPairs[i][1];
    const bitToEncrypt = null;  // get the current bit of the text

    // encrypt the bit to pixels
  }
  return pixelPairs;
}

function pixelPairsToPixelArray(pairs: number[][][]): number[][] {
  // convert pairs of pixels to pixel array
  return flatMap(pairs);
}
