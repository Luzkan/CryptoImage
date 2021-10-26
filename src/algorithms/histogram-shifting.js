// -------------------------------------------------------------
// Histogram shifting algorithm

function histogramShiftingEncrypt(pixel3DArray) {

    const channelArray = pixel3DArrayToChannelArray(pixel3DArray);

    channelArray.forEach(encryptInChannel)
    
    return channelArrayToPixel3DArray(channelArray)
}

function pixel3DArrayToChannelArray(pixel3DArray) {

    // convert pixel 3D array to three arrays representing R, G and B pixel values

    return [[], [], []];
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

    const temporaryUpsideDownImage = pixel3DArray.reverse();
    return encodeBMPFrom3dData(temporaryUpsideDownImage);
}