"use strict";
function littleEndianBytesToNumber(byteArray) {
    return byteArray.reduce((sum, byte, idx) => sum + (byte << (idx * 8)), 0);
}
function toArray(byteArray) {
    const length = byteArray.length;
    const array = new Array(length);
    for (let i = 0; i < length; i++) {
        array[i] = byteArray[i];
    }
    return array;
}
function littleEndianNumberToBytes(number, length) {
    const bytes = [];
    let value = number;
    for (let i = 0; i < length; i++) {
        bytes.push(value & 255);
        value = Math.floor(value >>> 8);
    }
    return bytes;
}
function generateArrayOfZeroes(length) {
    return new Array(length).fill(0);
}
class BMP {
    constructor(fileSize, width, height, pixels3D, pixelsArrayData, pixelPlainData, bytesPerPixel) {
        this.fileSize = fileSize;
        this.width = width;
        this.height = height;
        this.pixels3D = pixels3D;
        this.pixelsArrayData = pixelsArrayData;
        this.pixelPlainData = pixelPlainData;
        this.bytesPerPixel = bytesPerPixel;
    }
    static from(blob) {
        return blob.arrayBuffer().then(buffer => {
            const bytes = new Uint8Array(buffer);
            const type = new TextDecoder("ascii").decode(bytes.slice(0, 2));
            if (type !== "BM")
                throw new Error("Not a BMP file");
            const fileSize = littleEndianBytesToNumber(bytes.slice(2, 6));
            const pixelDataOffset = littleEndianBytesToNumber(bytes.slice(10, 14));
            const width = littleEndianBytesToNumber(bytes.slice(18, 22));
            const height = littleEndianBytesToNumber(bytes.slice(22, 26));
            const bitsPerPixel = littleEndianBytesToNumber(bytes.slice(28, 30));
            const bytesPerPixel = bitsPerPixel >>> 3;
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
            return new BMP(fileSize, width, height, pixels3D, pixelsArrayData, pixelPlainData, bytesPerPixel);
        });
    }
    static fromPlainData(plainData, width, height) {
        const bytesPerPixel = plainData.length / width / height;
        let pos = 0;
        const pixel3dArray = [];
        for (let i = 0; i < height; i++) {
            const row = [];
            for (let j = 0; j < width; j++) {
                row.push(plainData.slice(pos, pos + bytesPerPixel));
                pos += bytesPerPixel;
            }
            pixel3dArray.push(row);
        }
        return BMP.from3DArray(pixel3dArray);
    }
    static fromPixelArrayData(plainData, width) {
        const pixel3dArray = [];
        for (let pos = 0; pos < plainData.length; pos = pos + width) {
            pixel3dArray.push(plainData.slice(pos, pos + width));
        }
        return BMP.from3DArray(pixel3dArray);
    }
    static from3DArray(pixels3dData) {
        const height = pixels3dData.length;
        const width = pixels3dData[0].length;
        const bytesPerPixel = pixels3dData[0][0].length;
        const pixelsArrayData = flatMap(pixels3dData);
        const plainPixelsData = flatMap(pixelsArrayData);
        const imgBytesPerRow = width * bytesPerPixel;
        const bmpEndRowEmptyBytes = (4 - (imgBytesPerRow & 3)) & 3;
        const fileSize = 54 + height * (bmpEndRowEmptyBytes + imgBytesPerRow);
        return new BMP(fileSize, width, height, pixels3dData, pixelsArrayData, plainPixelsData, pixelsArrayData[0].length);
    }
    toBlob() {
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
function downloadBMP(bmp, fileName) {
    return downloadBlob(bmp.toBlob(), fileName);
}
function downloadBlob(blob, fileName) {
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', fileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}
