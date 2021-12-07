function bytesToWriteHist(bmp: BMP, payloadHeader?: number[], writeLocationMap?: number[]): number {
  if (!payloadHeader || !writeLocationMap) {
    const plainData = bmp.pixelPlainData;
    const histogram = buildHistogram(plainData)
    const { valueWithMinCount, valueWithMaxCount, minValueCount } = analyzeHistogram(histogram);

    if (valueWithMinCount === valueWithMaxCount) {
      throw new Error("Cannot embed any message in provided image")
    }
    payloadHeader = preparePayloadHeader(plainData, valueWithMinCount, minValueCount);
    writeLocationMap = prepareWriteLocationMap(plainData, valueWithMinCount, valueWithMaxCount);
  }

  const bytesCapacity = writeLocationMap.filter(value => value === 1).length;
  if (bytesCapacity < payloadHeader.length) {
    throw new Error("Cannot embed any message in provided image")
  }

  return bytesCapacity - payloadHeader.length;
}

function histogramShiftingEncrypt(bmp: BMP, asciiMessage: string): [BMP, [number, number]] {
  const plainData = bmp.pixelPlainData;
  const histogram = buildHistogram(plainData)
  const { valueWithMinCount, valueWithMaxCount, minValueCount } = analyzeHistogram(histogram);
  if (valueWithMinCount === valueWithMaxCount) {
    throw new Error("Cannot embed any message in provided image")
  }

  const payload = preparePayloadHeader(plainData, valueWithMinCount, minValueCount);
  const writeLocationMap = prepareWriteLocationMap(plainData, valueWithMinCount, valueWithMaxCount);
  if (bytesToWriteHist(bmp, payload, writeLocationMap) < asciiMessage.length) {
    throw new Error("Cannot embed that message in provided image")
  }

  addArrayValues(payload, asciiStringToCharCode(asciiMessage));
  const shifted = shiftHistogram(plainData, valueWithMinCount, valueWithMaxCount);
  const encrypted = writeBytes(writeLocationMap, shifted, payload);
  return [BMP.fromPlainData(encrypted, bmp.width, bmp.height), [valueWithMinCount, valueWithMaxCount]];
}

function prepareWriteLocationMap(plainData: number[], valueWithMinCount: number, valueWithMaxCount: number): number[] {
  const writeConditionValue = valueWithMinCount < valueWithMaxCount ? valueWithMaxCount - 1 : valueWithMaxCount + 1;
  return createLocationMap(plainData, writeConditionValue);
}

function writeBytes(writeLocationMap: number[], shifted: number[], bytesToWrite: number[]): number[] {
  let writeIdx = 0;
  const bytesToWriteLen = bytesToWrite.length;
  return writeLocationMap.map((isWritable, idx) => {
    if (isWritable === 1 && writeIdx < bytesToWriteLen) {
      return bytesToWrite[writeIdx++];
    } else {
      return shifted[idx];
    }
  })
}

function preparePayloadHeader(plainData: number[], valueWithMinCount: number, minValueCount: number): number[] {
  // if minValueCount === 0 location map is not included in bytes to write
  if (minValueCount === 0) {
    return [minValueCount];
  }
  const locationMap = createLocationMap(plainData, valueWithMinCount);
  const locMapBytes = bitsToByteArray(locationMap);
  const locMapCompressed = huffmanCompress(locMapBytes);
  locMapCompressed.unshift(minValueCount);
  return locMapCompressed;
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
