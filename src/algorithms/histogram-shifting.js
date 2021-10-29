// -------------------------------------------------------------
// Histogram shifting algorithm

function histogramShiftingEncrypt(pixel3DArray) {

    const channelArray = pixel3DArrayToChannelArray(pixel3DArray);

    channelArray.forEach(encryptInChannel)
    
    return channelArrayToPixel3DArray(pixel3DArray)
    // return channelArrayToPixel3DArray(channelArray)
}


class RGB {
    constructor(idx, red, green, blue, transparency) {
        this.idx = idx;
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.transparency = transparency;
    }
}

function pixel3DArrayToChannelArray(pixel3DArray) {
    let RGBChannelArray = [];
    let pixelIterator = 0;

    for (let channel in pixel3DArray) {
        for (let pixel in pixel3DArray[channel]) {
            RGBChannelArray.push(new RGB(
                pixelIterator,
                pixel3DArray[channel][pixel][0],
                pixel3DArray[channel][pixel][1],
                pixel3DArray[channel][pixel][2],
                pixel3DArray[channel][pixel][3]
            ));
            pixelIterator += 1;
        }
    }

    return RGBChannelArray;
}

function encryptInChannel(channel) {

    const histogram = channelToHistogram(channel)

    const minValueCount = Math.min(...histogram)
    const maxValueCount = Math.max(...histogram)
    const minValue = histogram.indexOf(minValueCount)
    const maxValue = histogram.indexOf(maxValueCount)

    if (minValue > 0) {
        appendMinValuePixels(channel, minValue)
    }

    shiftHistogram(channel, minValue, maxValue)
    encryptMessage(channel, maxValue)
}

function channelToHistogram(channel) {

    // convert channel pixel value array to a histogram - an array with 255 elements
    
    return [];
}

function appendMinValuePixels(channel, minValue) {

    // append positions and value of pixels with the least frequent value to the encrypted message
}

function shiftHistogram(channel, minValue, maxValue) {

    // shift histogram
}

function encryptMessage(channel, maxValue) {

    // encrypt the message
}

function channelArrayToPixel3DArray(channelArray) {

    // convert three channel arrays to a pixel 3D array

    const temporaryUpsideDownImage = channelArray.reverse();
    return encodeBMPFrom3dData(temporaryUpsideDownImage);
}