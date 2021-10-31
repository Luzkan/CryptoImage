"use strict";
// -------------------------------------------------------------
// Difference expansion algorithm
function bytesToWriteDE(bmp) {
    return Math.floor(bmp.pixelPlainData.length / 2 / 8);
}
function differentialExpansionEncrypt(bmp, asciiMessage) {
    if (bytesToWriteDE(bmp) < asciiMessage.length) {
        throw new Error("Message is to big !!!");
    }
    const pixelPairs = bmpToPixelPairs(bmp);
    const byteArray = asciiStringToCharCode(asciiMessage);
    const encryptedPairs = encryptDE(pixelPairs, byteArray);
    return pixelPairsToBMP(encryptedPairs, bmp.bytesPerPixel, bmp.width);
}
function differentialExpansionDecrypt(bmp) {
    const pixelPairs = bmpToPixelPairs(bmp);
    const [decryptedPairs, byteArray] = decryptDE(pixelPairs);
    const message = charCodeArrayToString(byteArray);
    const orgBmp = pixelPairsToBMP(decryptedPairs, bmp.bytesPerPixel, bmp.width);
    return [orgBmp, message];
}
function encryptDE(pixelPairs, payloadBytes) {
    const payloadBits = toBitArray(payloadBytes);
    const messageLength = payloadBits.length;
    const encryptedPairs = [];
    for (let i = 0; i < messageLength; i++) {
        const pixelA = pixelPairs[i][0];
        const pixelB = pixelPairs[i][1];
        const bit = payloadBits[i];
        encryptedPairs.push(encryptDEValue(pixelA, pixelB, bit));
    }
    for (let i = messageLength; i < pixelPairs.length; i++) {
        const pixelA = pixelPairs[i][0];
        const pixelB = pixelPairs[i][1];
        encryptedPairs.push(encryptDEValue(pixelA, pixelB, 0));
    }
    return encryptedPairs;
}
function decryptDE(pixelPairs) {
    const decryptedPairs = [];
    const decryptedBits = [];
    const iterations = pixelPairs[pixelPairs.length - 1].length == 2 ? pixelPairs.length : pixelPairs.length - 1;
    for (let i = 0; i < iterations; i++) {
        const pixelA = pixelPairs[i][0];
        const pixelB = pixelPairs[i][1];
        const [pair, bit] = decryptDEPair(pixelA, pixelB);
        decryptedPairs.push(pair);
        decryptedBits.push(bit);
    }
    if (iterations != pixelPairs.length) {
        decryptedPairs.push(pixelPairs[pixelPairs.length - 1]);
    }
    const encryptedBytes = bitsToByteArray(decryptedBits);
    return [decryptedPairs, encryptedBytes];
}
function encryptDEValue(pixelA, pixelB, bitValue) {
    const diff = (pixelA - pixelB) & 0xFF;
    const avg = (pixelB + (diff >>> 1)) & 0xFF;
    const newDiff = (((diff + 64) & 0xFF) << 1 | bitValue) & 0xFF;
    const x = avg + Math.floor(0.5 * (newDiff + 1)) & 0xFF;
    const y = avg - Math.floor(0.5 * (newDiff)) & 0xFF;
    return [x, y];
}
function decryptDEPair(pixelA, pixelB) {
    const diff = (pixelA - pixelB) & 0xFF;
    const avg = (pixelB + (diff >>> 1)) & 0xFF;
    const newDiff = ((diff >> 1) - 64) & 0xFF;
    const bit = diff & 0x1;
    const x = avg + Math.floor(0.5 * (newDiff + 1)) & 0xFF;
    const y = avg - Math.floor(0.5 * (newDiff)) & 0xFF;
    return [[x, y], bit];
}
function bmpToPixelPairs(bmp) {
    const channels = pixelArrayToChannelArray(bmp.pixelsArrayData);
    // less probability of overfill if not mix colours in pairs
    const channelsFlat = flatMap(channels);
    const pairs = [];
    for (let pos = 0; pos < channelsFlat.length; pos = pos + 2) {
        pairs.push(channelsFlat.slice(pos, pos + 2));
    }
    return pairs;
}
function pixelPairsToBMP(pairs, pixelDepth, width) {
    const channelsFlat = flatMap(pairs);
    const channelLength = channelsFlat.length / pixelDepth;
    const channels = [];
    for (let pos = 0; pos < channelsFlat.length; pos = pos + channelLength) {
        channels.push(channelsFlat.slice(pos, pos + channelLength));
    }
    const pixelArray = channelArrayToPixelArray(channels, pixelDepth);
    return BMP.fromPixelArrayData(pixelArray, width);
}
