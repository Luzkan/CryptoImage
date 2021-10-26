function littleEndianBytesToNumber(byteArray) {
    return byteArray.reduce((sum, byte, idx) => sum + (byte << (idx * 8)), 0);
}

function littleEndianNumberToBytes(number, length) {
    const bytes = [];
    let value = number;
    for (let i = 0; i < length; i++) {
        bytes.push(value & 255);
        value = Math.floor(value >> 8);
    }
    return bytes;
}

function generateArrayOfZeroes(length) {
    return new Array(length).fill(0);
}

function flatMap(array) {
    const flat = [];
    for (let i = 0; i < array.length; i++)
        for (let inner = array[i], j = 0; j < inner.length; j++)
            flat.push(inner[j]);
    return flat;
}

async function decodeBMP(blob) {
    const buffer = await blob.arrayBuffer()
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
            row.push(pixelData);
            pos = pos + bytesPerPixel;
        }
        pixels3D.push(row);
        pos = pos + endRowEmptyBytes;
    }
    const pixelPlainData = flatMap(flatMap(pixels3D));

    return {
        fileSize,
        width,
        height,
        pixels3D,
        pixelPlainData,
        bytesPerPixel
    }

}


async function encodeBMPFrom3dData(pixels3dData) {
    const plainPixelsData = flatMap(flatMap(pixels3dData));
    return await encodeBMP(plainPixelsData, pixels3dData[0].length, pixels3dData.length);
}

async function encodeBMP(plainPixelsData, width, height) {
    const imgPixelsCount = width * height;
    const imgPixelsDataLen = plainPixelsData.length;
    const bytesPerPixel = imgPixelsDataLen / imgPixelsCount;
    const bitsPerPixel = bytesPerPixel << 3;
    const imgBytesPerRow = width * bytesPerPixel;
    const bmpEndRowEmptyBytes = (4 - (imgBytesPerRow & 3)) & 3;

    let bmpPixelsDataParts = [];
    for (let i = 0; i < imgPixelsDataLen; i = i + imgBytesPerRow) {
        bmpPixelsDataParts.push(plainPixelsData.slice(i, i + imgBytesPerRow));
        bmpPixelsDataParts.push(generateArrayOfZeroes(bmpEndRowEmptyBytes));
    }

    const bmpPixelsData = flatMap(bmpPixelsDataParts);
    const fileSize = 54 + bmpPixelsData.length;

    const bmpByteArrayParts = [];
    // 14 bits
    bmpByteArrayParts.push(new TextEncoder().encode("BM"));
    bmpByteArrayParts.push(littleEndianNumberToBytes(fileSize, 4));
    bmpByteArrayParts.push(generateArrayOfZeroes(4));
    bmpByteArrayParts.push(littleEndianNumberToBytes(54, 4));

    // 40 bits
    bmpByteArrayParts.push(littleEndianNumberToBytes(40, 4));
    bmpByteArrayParts.push(littleEndianNumberToBytes(width, 4));
    bmpByteArrayParts.push(littleEndianNumberToBytes(height, 4));
    bmpByteArrayParts.push(littleEndianNumberToBytes(1, 2));
    bmpByteArrayParts.push(littleEndianNumberToBytes(bitsPerPixel, 2));
    bmpByteArrayParts.push(generateArrayOfZeroes(24));

    // content
    bmpByteArrayParts.push(bmpPixelsData);
    const bmpByteArray = flatMap(bmpByteArrayParts);

    return new Blob([new Uint8Array(bmpByteArray)], {type: 'image/bmp'});
}


// Download file:
function downloadBlob(blob, fileName) {
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', fileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}
