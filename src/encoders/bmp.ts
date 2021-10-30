function littleEndianBytesToNumber(byteArray: Uint8Array): number {
  return byteArray.reduce((sum: number, byte: number, idx: number) => sum + (byte << (idx * 8)), 0);
}

function toArray(byteArray: Uint8Array): number[] {
  const length = byteArray.length;
  const array = new Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = byteArray[i];
  }
  return array;
}

function littleEndianNumberToBytes(number: number, length: number): number[] {
  const bytes = [];
  let value = number;
  for (let i = 0; i < length; i++) {
    bytes.push(value & 255);
    value = Math.floor(value >> 8);
  }
  return bytes;
}

function generateArrayOfZeroes(length: number): number[] {
  return new Array(length).fill(0);
}

function flatMap<T>(array: T[][]): (T)[] {
  const flat = [];
  for (let i = 0; i < array.length; i++)
    for (let inner = array[i], j = 0; j < inner.length; j++)
      flat.push(inner[j]);
  return flat;
}

class BMP {
  private constructor(
    public readonly fileSize: number,
    public readonly width: number,
    public readonly height: number,
    public readonly pixels3D: number[][][],
    public readonly pixelsArrayData: number[][],
    public readonly pixelPlainData: number[],
    public readonly bytesPerPixel: number,
  ) {
  }

  static from(blob: Blob): Promise<BMP> {
    return blob.arrayBuffer().then(buffer => {
      const bytes = new Uint8Array(buffer);
      const type = new TextDecoder("ascii").decode(bytes.slice(0, 2));
      if (type !== "BM") throw new Error("Not a BMP file");


      const fileSize = littleEndianBytesToNumber(bytes.slice(2, 6));
      const pixelDataOffset = littleEndianBytesToNumber(bytes.slice(10, 14));
      const width = littleEndianBytesToNumber(bytes.slice(18, 22));
      const height = littleEndianBytesToNumber(bytes.slice(22, 26));
      const bitsPerPixel = littleEndianBytesToNumber(bytes.slice(28, 30));

      const bytesPerPixel = bitsPerPixel >> 3;
      const pixelsData = bytes.slice(pixelDataOffset);

      const pixels3D = [];

      let pos = 0;
      const bytesPerRow = width * bytesPerPixel;
      const endRowEmptyBytes = (4 - (bytesPerRow & 3)) & 3;
      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          const pixelData = pixelsData.slice(pos, pos + bytesPerPixel);
          row.push(toArray(pixelData));
          pos = pos + bytesPerPixel;
        }
        pixels3D.push(row);
        pos = pos + endRowEmptyBytes;
      }
      const pixelsArrayData = flatMap(pixels3D);
      const pixelPlainData = flatMap(pixelsArrayData);

      return new BMP(
        fileSize,
        width,
        height,
        pixels3D,
        pixelsArrayData,
        pixelPlainData,
        bytesPerPixel
      );
    })
  }

  static fromPlainData(plainData: number[], width: number, height: number): BMP {
    const bytesPerPixel = plainData.length / width / height;

    let pos = 0;
    const pixel3dArray = [];
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        row.push(plainData.slice(pos, pos + bytesPerPixel))
        pos += bytesPerPixel;
      }
      pixel3dArray.push(row);
    }
    return BMP.from3DArray(pixel3dArray);
  }

  static fromPixelArrayData(plainData: number[][], width: number): BMP {
    const pixel3dArray = [];
    for (let pos = 0; pos < plainData.length; pos = pos + width) {
      pixel3dArray.push(plainData.slice(pos, pos + width));
    }
    return BMP.from3DArray(pixel3dArray);
  }

  static from3DArray(pixels3dData: number[][][]): BMP {
    const height = pixels3dData.length;
    const width = pixels3dData[0].length;
    const bytesPerPixel = pixels3dData[0][0].length;

    const pixelsArrayData = flatMap(pixels3dData);
    const plainPixelsData = flatMap(pixelsArrayData);

    const imgBytesPerRow = width * bytesPerPixel;
    const bmpEndRowEmptyBytes = (4 - (imgBytesPerRow & 3)) & 3;
    const fileSize = 54 + height * (bmpEndRowEmptyBytes + imgBytesPerRow);
    return new BMP(
      fileSize,
      width,
      height,
      pixels3dData,
      pixelsArrayData,
      plainPixelsData,
      pixelsArrayData[0].length
    );
  }

  toBlob(): Blob {
    const imgBytesPerRow = this.width * this.bytesPerPixel;
    const bmpEndRowEmptyBytes = (4 - (imgBytesPerRow & 3)) & 3;

    let bmpPixelsDataParts = [];
    for (let i = 0; i < this.pixelPlainData.length; i = i + imgBytesPerRow) {
      bmpPixelsDataParts.push(this.pixelPlainData.slice(i, i + imgBytesPerRow));
      bmpPixelsDataParts.push(generateArrayOfZeroes(bmpEndRowEmptyBytes));
    }

    const bmpPixelsData = flatMap(bmpPixelsDataParts);
    const bmpByteArrayParts = [];
    // 14 bits
    bmpByteArrayParts.push(toArray(new TextEncoder().encode("BM")));
    bmpByteArrayParts.push(littleEndianNumberToBytes(this.fileSize, 4));
    bmpByteArrayParts.push(generateArrayOfZeroes(4));
    bmpByteArrayParts.push(littleEndianNumberToBytes(54, 4));

    // 40 bits
    bmpByteArrayParts.push(littleEndianNumberToBytes(40, 4));
    bmpByteArrayParts.push(littleEndianNumberToBytes(this.width, 4));
    bmpByteArrayParts.push(littleEndianNumberToBytes(this.height, 4));
    bmpByteArrayParts.push(littleEndianNumberToBytes(1, 2));
    bmpByteArrayParts.push(littleEndianNumberToBytes(this.bytesPerPixel << 3, 2));
    bmpByteArrayParts.push(generateArrayOfZeroes(24));

    // content
    bmpByteArrayParts.push(bmpPixelsData);
    const bmpByteArray = flatMap(bmpByteArrayParts);

    return new Blob([new Uint8Array(bmpByteArray)], { type: 'image/bmp' });
  }
}

// Download file:
function downloadBMP(bmp: BMP, fileName: string) {
  return downloadBlob(bmp.toBlob(), fileName);
}

function downloadBlob(blob: Blob, fileName: string) {
  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.setAttribute('download', fileName);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}
