"use strict";
function pixelArrayToChannelArray(pixelArray) {
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
function channelArrayToPixelArray(channelArray, depth) {
    const pixelArray = [];
    for (let i = 0; i < channelArray[0].length; i++) {
        const pixel = [];
        for (let j = 0; j < depth; j++) {
            pixel.push(channelArray[j][i]);
        }
        pixelArray.push(pixel);
    }
    return pixelArray;
}
function asciiStringToCharCode(asciiText) {
    const charCodeArray = [];
    for (let pos = 0; pos < asciiText.length; pos++) {
        charCodeArray.push(asciiText.charCodeAt(pos) & 0xFF);
    }
    return charCodeArray;
}
function charCodeArrayToString(charCodeArray) {
    return charCodeArray.map(code => String.fromCharCode(code)).join('');
}
function toBitArray(byteArray) {
    const bits = [];
    for (let pos = 0; pos < byteArray.length; pos++) {
        const byte = byteArray[pos];
        for (let bit = 7; bit >= 0; bit--) {
            bits.push((byte >>> bit) & 0x1);
        }
    }
    return bits;
}
function toBitArrays(byteArray) {
    const bits = [];
    for (let pos = 0; pos < byteArray.length; pos++) {
        const byte = byteArray[pos];
        const currentBitArray = [];
        for (let bit = 7; bit >= 0; bit--) {
            currentBitArray.push((byte >>> bit) & 0x1);
        }
        bits.push(currentBitArray);
    }
    return bits;
}
function bitsToByteArray(bitsArray) {
    let zeroes = bitsArray.length % 8;
    zeroes = zeroes === 0 ? 0 : 8 - zeroes;
    bitsArray.push(...new Array(zeroes).fill(0));
    const bytes = [];
    for (let pos = 0; pos < bitsArray.length;) {
        let byte = 0;
        for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
            byte = (bitsArray[pos] << bitIdx) | byte;
            pos++;
        }
        bytes.push(byte);
    }
    return bytes;
}
