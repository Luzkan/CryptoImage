function pixelArrayToChannelArray(pixelArray: number[][]): number[][] {
  const channels = [];
  for (let channel = 0; channel < pixelArray[0].length; channel++) {
    const channelValues = [];
    for (let i = 0; i < pixelArray.length; i++) {
      channelValues.push(pixelArray[i][channel]);
    }
    channels.push(channelValues);
  }
  return channels;
}

function channelArrayToPixelArray(channelArray: number[][], depth: number): number[][] {
  const pixelArray = [];
  for (let i = 0; i < channelArray[0].length; i++) {
    const pixel = []
    for (let j = 0; j < depth; j++) {
      pixel.push(channelArray[j][i])
    }
    pixelArray.push(pixel)
  }
  return pixelArray;
}

function asciiStringToCharCode(asciiText: string): number[] {
  const charCodeArray = [];
  for (let pos = 0; pos < asciiText.length; pos++) {
    charCodeArray.push(asciiText.charCodeAt(pos) & 0xFF);
  }
  return charCodeArray
}

function charCodeArrayToString(charCodeArray: number[]): string {
  return charCodeArray.map(code => String.fromCharCode(code)).join('')
}

function toBitArray(byteArray: number[]): number[] {
  const bits = [];
  for (let pos = 0; pos < byteArray.length; pos++) {
    const byte = byteArray[pos];
    for (let bit = 7; bit >= 0; bit--) {
      bits.push((byte >>> bit) & 0x1);
    }
  }
  return bits
}

function bitsToByteArray(bitsArray: number[]): number[] {
  let zeroes = bitsArray.length % 8;
  zeroes = zeroes === 0 ? 0 : 8 - zeroes;
  bitsArray.push(...new Array(zeroes).fill(0))

  const bytes = [];
  for (let pos = 0; pos < bitsArray.length;) {
    let byte = 0;
    for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
      byte = (bitsArray[pos] << bitIdx) | byte;
      pos++;
    }
    bytes.push(byte)
  }
  return bytes;
}

function createLocationMap(values: number[], searchValue: number): number[] {
  return values.map(item => item === searchValue ? 1 : 0);
}

function flatMap<T>(array: T[][]): (T)[] {
  const flat = [];
  for (let i = 0; i < array.length; i++)
    for (let inner = array[i], j = 0; j < inner.length; j++)
      flat.push(inner[j]);
  return flat;
}

function addArrayValues<T>(array: T[], values: T[]): (T)[] {
  for (let i = 0; i < values.length; i++)
    array.push(values[i]);
  return array;
}
