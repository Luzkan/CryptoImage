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

function pixel3DArrayToChannelArray(pixel3DArray: [number, number, number, number][][]) {
    let RGBChannelArray = pixel3DArray.flat().map((pixel: any, i: number) => new RGB(i, ...pixel))
    if (DEBUG) {console.log(RGBChannelArray)}
    return RGBChannelArray;
}



// -------------------------------------------------------------
// Histogram shifting algorithm

function histogramShiftingEncrypt(pixel3DArray: [number, number, number, number][][]) {
    const channelArray = pixel3DArrayToChannelArray(pixel3DArray);
    channelArray.forEach(encryptInChannel)
    return channelArrayToPixel3DArray(channelArray)
}



function encryptInChannel(channel: any) {

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

function channelToHistogram(channel: any) {
    // Convert RGB channel pixel value array to a histogram - an array with 255 elements
    return [];
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

function channelArrayToPixel3DArray(channelArray: any[]) {
    // Convert three channel arrays to a Pixel 3D Array
    const temporaryUpsideDownImage = channelArray.reverse();
    return encodeBMPFrom3dData(temporaryUpsideDownImage);
}