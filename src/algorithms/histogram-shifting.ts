function bytesToWriteHS(bmp: BMP, payloadHeader?: number[], valueWithMaxCount?: number): number {
  if (!payloadHeader || Number.isNaN(valueWithMaxCount)) {
    const plainData = bmp.pixelPlainData;
    const histogram = buildHistogram(plainData)
    const { valueWithMinCount, valueWithMaxCount, minValueCount } = analyzeHistogram(histogram);

    if (Math.abs(valueWithMinCount - valueWithMaxCount) < 2) {
      throw new Error("Cannot embed any message in provided image: Math.abs(valueWithMinCount - valueWithMaxCount) < 2");
    }
    payloadHeader = preparePayloadHeader(plainData, valueWithMinCount, minValueCount);
  }

  const bitsGrossCapacity = bmp.pixelPlainData.filter(value => value === valueWithMaxCount).length;
  const bitsNetCapacity = bitsGrossCapacity - payloadHeader.length;
  const bytesNetCapacity = Math.floor(bitsNetCapacity / 8);
  console.log("Hist: Net bytes capacity:", bytesNetCapacity);

  if (bytesNetCapacity <= 0) {
    throw new Error("Cannot embed any message in provided image: payloadHeader use all bmp capacity")
  }
  return bytesNetCapacity;
}

function histogramShiftingEncrypt(bmp: BMP, asciiMessage: string): [BMP, [number, number]] {
  const plainData = bmp.pixelPlainData;
  const histogram = buildHistogram(plainData)
  const { valueWithMinCount, valueWithMaxCount, minValueCount } = analyzeHistogram(histogram);
  if (Math.abs(valueWithMinCount - valueWithMaxCount) < 2) {
    throw new Error("Cannot embed any message in provided image: Math.abs(valueWithMinCount - valueWithMaxCount) < 2")
  }

  const payloadBits = preparePayloadHeader(plainData, valueWithMinCount, minValueCount);
  if (bytesToWriteHS(bmp, payloadBits, valueWithMaxCount) < asciiMessage.length) {
    throw new Error("Cannot embed that message in provided image: Message to long")
  }

  addArrayValues(payloadBits, toBitArray(asciiStringToCharCode(asciiMessage)));
  const shifted = shiftHistogram(plainData, valueWithMinCount, valueWithMaxCount);
  const encrypted = writeBytes(shifted, payloadBits, valueWithMinCount, valueWithMaxCount);
  return [BMP.fromPlainData(encrypted, bmp.width, bmp.height), [valueWithMinCount, valueWithMaxCount]];
}


function histogramShiftingDecrypt(bmp: BMP, keys: [number, number]): [BMP, string] {
  return [bmp, '']
}

function writeBytes(shifted: number[], bitsToWrite: number[], valueWithMinCount: number, valueWithMaxCount: number): number[] {
  const diff = valueWithMinCount < valueWithMaxCount ? -1 : 1;

  let writeIdx = 0;
  const bitsToWriteLen = bitsToWrite.length;
  return shifted.map(value => {
    if (value !== valueWithMaxCount || writeIdx === bitsToWriteLen || bitsToWrite[writeIdx++] === 0) {
      return value;
    } else {
      return value + diff;
    }
  })
}

// return bits
function preparePayloadHeader(plainData: number[], valueWithMinCount: number, minValueCount: number): number[] {
  // if minValueCount === 0 location map is not included in bytes to write
  if (minValueCount === 0) {
    return [minValueCount];
  }
  console.log('Hist: payload extended mode!')
  const locationMap = createLocationMap(plainData, valueWithMinCount);
  const locMapBytes = bitsToByteArray(locationMap);
  const locMapCompressedBits = huffmanCompress(locMapBytes);
  locMapCompressedBits.unshift(1);
  return locMapCompressedBits;
}

function analyzeHistogram(histogram: number[]) {
  let valueWithMinCount = 0;
  let valueWithMaxCount = 0;
  let minValueCount = histogram[valueWithMinCount]
  let maxValueCount = histogram[valueWithMaxCount]

  histogram.forEach((valueCount, value) => {
    if (minValueCount > valueCount) {
      minValueCount = valueCount;
      valueWithMinCount = value;
    }
    if (maxValueCount < valueCount) {
      maxValueCount = valueCount;
      valueWithMaxCount = value;
    }
  })
  return { valueWithMinCount, valueWithMaxCount, minValueCount, maxValueCount };
}

function buildHistogram(channel: number[]): number[] {
  const hist = new Array(256).fill(0);
  channel.forEach(value => hist[value]++)
  return hist;
}

function shiftHistogram(data: number[], valueWithMinCount: number, valueWithMaxCount: number): number[] {
  const isMinSmaller = valueWithMinCount < valueWithMaxCount;

  const min = isMinSmaller ? valueWithMinCount : valueWithMaxCount;
  const max = isMinSmaller ? valueWithMaxCount : valueWithMinCount;
  const diff = isMinSmaller ? -1 : 1;

  return data.map(value => {
    if (value > min && value < max) {
      return value + diff;
    } else {
      return value;
    }
  })
}
