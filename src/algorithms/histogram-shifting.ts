// -------------------------------------------------------------
// Things that possibly could get exported out to a separate file

class RGB {
  index: number;
  red: number;
  green: number;
  blue: number;
  transparency: number;

  constructor(index: number, red: number, green: number, blue: number, transparency: number) {
    this.index = index;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.transparency = transparency;
  }
}


// -------------------------------------------------------------
// Histogram shifting algorithm

function histogramShiftingEncrypt(bmp: BMP): BMP {
  const channelArray = pixelArrayToChannelArray(bmp.pixelsArrayData);
  const encryptedChannels = channelArray.map(encryptInChannel)
  const pixelArray = channelArrayToPixelArray(encryptedChannels, bmp.bytesPerPixel)
  return BMP.fromPixelArrayData(pixelArray, bmp.width)
}

function encryptInChannel(channel: number[]) {

  const histogram = channelToHistogram(channel)

  const minValueCount = Math.min(...histogram)
  const maxValueCount = Math.max(...histogram)
  const minValue = histogram.indexOf(minValueCount)
  const maxValue = histogram.indexOf(maxValueCount)

  const channel1 = minValue > 0 ? appendMinValuePixels(channel, minValue) : channel;

  const shifted = shiftHistogram(channel1, minValue, maxValue)
  const encrypted = encryptMessage(shifted, maxValue);
  // TODO:
  return channel;
}

function channelToHistogram(channel: number[]): number[] {
  const hist = new Array(256).fill(0);
  channel.forEach(value => hist[value]++)
  return hist;
}

function appendMinValuePixels(channel: any, minValue: number) {
  // Append positions and value of pixels with the least frequent value to the encrypted message
}

function shiftHistogram(channel: any, minValue: number, maxValue: number) {
  // Shift Histogram
}

function encryptMessage(channel: any, maxValue: number) {
  // Encrypt the Message
}
