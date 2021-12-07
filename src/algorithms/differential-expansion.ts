// -------------------------------------------------------------
// Difference expansion algorithm

const diffShift = 0;

function bytesToWriteDE(bmp: BMP, compressedMapLen?: number, diffs?: number[]): number {
  if (!compressedMapLen || !diffs) {
    const pixelPairs = bmpToPixelPairs(bmp);
    diffs = createDiffBitsMap(pixelPairs);

    // console.log("8: ", diffs.filter(item => item === 8).length);
    // console.log("7: ", diffs.filter(item => item === 7).length);
    // console.log("6: ", diffs.filter(item => item === 6).length);
    // console.log("5: ", diffs.filter(item => item === 5).length);
    // console.log("4: ", diffs.filter(item => item === 4).length);
    // console.log("3: ", diffs.filter(item => item === 3).length);
    // console.log("2: ", diffs.filter(item => item === 2).length);
    // console.log("1: ", diffs.filter(item => item === 1).length);
    // console.log("0: ", diffs.filter(item => item === 0).length);
    // console.log("NaN: ", diffs.filter(item => isNaN(item)).length);

    const locMap7 = createLocationMap(diffs, 7);
    const bytes = bitsToByteArray(locMap7);
    compressedMapLen = huffmanCompress(bytes).length;
  }
  const availableToWrite = diffs.filter(item => item !== 8);
  const mapAvailableSize = availableToWrite.filter(item => item !== 7).length;
  const availableSize = availableToWrite.length;

  const messageSize = Math.floor((availableSize - compressedMapLen) / 8);
  return compressedMapLen > mapAvailableSize ? 0 : messageSize;
}

function differentialExpansionEncrypt(bmp: BMP, asciiMessage: string): BMP {
  const pixelPairs = bmpToPixelPairs(bmp);
  const diffBitsMap = createDiffBitsMap(pixelPairs);
  const locMap7 = createLocationMap(diffBitsMap, 7);
  const locMap7Bytes = bitsToByteArray(locMap7);
  const locMap7compressed = huffmanCompress(locMap7Bytes);

  if (bytesToWriteDE(bmp, locMap7compressed.length, diffBitsMap) < asciiMessage.length) {
    throw new Error("Cannot embed that message in provided image")
  }

  const byteArray = asciiStringToCharCode(asciiMessage);
  const bitsArray = toBitArray(byteArray);
  const bitsToWrite = flatMap([locMap7compressed, bitsArray]);
  encryptDEInPairs(pixelPairs, diffBitsMap, bitsToWrite);
  const pixelsToWrite = pixelPairsToPixelArray(pixelPairs, bmp.bytesPerPixel);
  return BMP.fromPixelArrayData(pixelsToWrite, bmp.width)
}

function differentialExpansionDecrypt(bmp: BMP): [BMP, string] {
  const pixelPairs = bmpToPixelPairs(bmp);
  const mapBytesLength = Math.floor((pixelPairs.length - 1) / 8) + 1;
  const diffBitsMap = createDiffBitsMap(pixelPairs, true);
  const compressed = decodeUpTo7DiffInPairs(pixelPairs, diffBitsMap)
  const [locMap7, payload1] = huffmanDecompress(compressed, mapBytesLength)
  const payload2 = decryptFromLocMapInPairs(pixelPairs, locMap7);
  const bytePayload = bitsToByteArray(flatMap([payload1, payload2]));
  const pixelsToWrite = pixelPairsToPixelArray(pixelPairs, bmp.bytesPerPixel);
  const orgBmp = BMP.fromPixelArrayData(pixelsToWrite, bmp.width);
  const message = charCodeArrayToString(bytePayload);
  const tailBeginIdx = message.indexOf(String.fromCharCode(0));
  return [orgBmp, message.slice(0, tailBeginIdx)];
}

function createDiffBitsMap(pairs: number[][], decoding = false): number[] {
  return pairs.map((pair) => {
    if (pair.length < 2) {
      return NaN;
    }
    const diff = (pair[0] - pair[1] + (decoding ? 0 : diffShift)) & 0xFF;
    let diffOrder = 0x80;
    for (let i = 8; i >= 0; i--) {
      if ((diff & diffOrder) === diffOrder) {
        return i;
      }
      diffOrder = diffOrder >>> 1;
    }
    return NaN;
  });
}

function encryptDEInPairs(pixelPairs: number[][], diffBitsMap: number[], payloadBits: number[]): void {
  const writeOrder: number[] = [];
  for (let i = 0; i < 8; i++) {
    diffBitsMap.forEach((item, idx) => item === i ? writeOrder.push(idx) : null);
  }

  const messageLength = payloadBits.length;
  for (let i = 0; i < messageLength; i++) {
    const bit = payloadBits[i]
    const pixelIdx = writeOrder[i];
    const pixelA = pixelPairs[pixelIdx][0];
    const pixelB = pixelPairs[pixelIdx][1];
    pixelPairs[pixelIdx] = encryptDEValue(pixelA, pixelB, bit);
  }

  for (let i = messageLength; i < writeOrder.length; i++) {
    const pixelIdx = writeOrder[i];
    const pixelA = pixelPairs[pixelIdx][0];
    const pixelB = pixelPairs[pixelIdx][1];
    pixelPairs[pixelIdx] = encryptDEValue(pixelA, pixelB, 0);
  }
}


function decodeUpTo7DiffInPairs(pixelPairs: number[][], diffBitsMap: number[]): number[] {
  const readOrder: number[] = [];
  diffBitsMap.forEach((item, idx) => item === 0 || item === 1 ? readOrder.push(idx) : null);
  for (let i = 2; i < 8; i++) {
    diffBitsMap.forEach((item, idx) => item === i ? readOrder.push(idx) : null);
  }

  const decryptedBits = [];
  for (let i = 0; i < readOrder.length; i++) {
    const pixelIdx = readOrder[i];
    const pixelA = pixelPairs[pixelIdx][0];
    const pixelB = pixelPairs[pixelIdx][1];
    const [pair, bit] = decryptDEPair(pixelA, pixelB);
    pixelPairs[pixelIdx] = pair;
    decryptedBits.push(bit);
  }
  return decryptedBits;
}

function decryptFromLocMapInPairs(pixelPairs: number[][], locMap7: number[]): number[] {
  const decryptedBits = [];
  for (let i = 0; i < pixelPairs.length; i++) {
    if (locMap7[i]) {
      const pixelA = pixelPairs[i][0];
      const pixelB = pixelPairs[i][1];
      const [pair, bit] = decryptDEPair(pixelA, pixelB)
      decryptedBits.push(bit);
      pixelPairs[i] = pair;
    }
  }
  return decryptedBits;
}

function encryptDEValue(pixelA: number, pixelB: number, bitValue: number): number[] {
  const diff = (pixelA - pixelB) & 0xFF;
  const avg = (pixelB + (diff >>> 1)) & 0xFF

  const newDiff = (((diff + diffShift) & 0xFF) << 1 | bitValue) & 0xFF;

  const x = avg + Math.floor(0.5 * (newDiff + 1)) & 0xFF;
  const y = avg - Math.floor(0.5 * (newDiff)) & 0xFF;

  return [x, y];
}

function decryptDEPair(pixelA: number, pixelB: number): [number[], number] {
  const diff = (pixelA - pixelB) & 0xFF;
  const avg = (pixelB + (diff >>> 1)) & 0xFF

  const newDiff = ((diff >> 1) - diffShift) & 0xFF;
  const bit = diff & 0x1;

  const x = avg + Math.floor(0.5 * (newDiff + 1)) & 0xFF;
  const y = avg - Math.floor(0.5 * (newDiff)) & 0xFF;

  return [[x, y], bit];
}

function bmpToPixelPairs(bmp: BMP): number[][] {
  const channels = pixelArrayToChannelArray(bmp.pixelsArrayData)

  // less probability of overfill if not mix colours in pairs
  const channelsFlat = flatMap(channels)
  const pairs = [];
  for (let pos = 0; pos < channelsFlat.length; pos = pos + 2) {
    pairs.push(channelsFlat.slice(pos, pos + 2))
  }
  return pairs;
}

function pixelPairsToPixelArray(pairs: number[][], pixelDepth: number): number[][] {
  const channelsFlat = flatMap(pairs);
  const channelLength = channelsFlat.length / pixelDepth;
  const channels = []
  for (let pos = 0; pos < channelsFlat.length; pos = pos + channelLength) {
    channels.push(channelsFlat.slice(pos, pos + channelLength))
  }
  return channelArrayToPixelArray(channels, pixelDepth);
}
