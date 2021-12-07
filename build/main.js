"use strict";
// -------------------------------------------------------------
// Initialization
// Developer Logging
const DEBUG = true;
// -------------------------------------------------------------
// Data Storages
// Class storing the variables for the image
class EncryptedFile {
    constructor(name, encryptedImage1, encryptedImage2, encryptedImage3) {
        this.name = name;
        this.encryptedImage1 = encryptedImage1;
        this.encryptedImage2 = encryptedImage2;
        this.encryptedImage3 = encryptedImage3;
    }
}
// Method Checkboxes
const checkbox1 = document.getElementById("method-1-checkbox");
const checkbox2 = document.getElementById("method-2-checkbox");
const checkbox3 = document.getElementById("method-3-checkbox");
// Label Counters
const imageSizeCounterLabel = document.getElementById("image-size-counter");
const availableSizeCounterLabel = document.getElementById("availalbe-size-counter");
const decodeSizeCounterLabel = document.getElementById("decode-size-counter");
// Globally scoped variables
let image_output = null; // EncryptedFile holder
let encrypted_text = null; // Textfield Text Value
// -------------------------------------------------------------
// Misc Functions
function enableEncryptButton() {
    // Enable the encrypt button if the textfield is not empty
    const encryptButton = document.getElementById("btn-encrypt");
    const encryptButtonTooltip = document.getElementById("btn-encrypt-tooltip");
    // if encryptButton is not null, enable it
    if (encryptButton && encryptButtonTooltip) {
        encryptButton.disabled = false;
        encryptButtonTooltip.classList.add("permamently-transparent");
    }
}
// -------------------------------------------------------------
// Actions
// This updates the global text variable on any input change
const cryptoImageMessage = document.getElementById("crypto-image-message");
cryptoImageMessage.addEventListener('input', (event) => {
    if (event) {
        encrypted_text = event.target.value;
    }
    if (DEBUG) {
        console.log(encrypted_text);
    }
});
// After any image file is provided, immiedietly convert
const formInputImage = document.getElementById("form-input-image");
formInputImage.addEventListener('input', async (e) => {
    // Retrieve Imagefile
    const file = e.target.files[0];
    // Decode & Create Pixel 3D Array
    const bmp = await BMP.from(file);
    if (DEBUG) {
        console.log(bmp);
    }
    console.log("# Capacity Ascii Letters:", bytesToWriteDE(bmp));
    const ipsum = "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus ornare, lorem eget lacinia congue, erat nibh dictum ante, eu cursus ligula erat non nibh. Morbi tellus odio, porta a leo ac, faucibus egestas nibh. Vivamus leo dui, varius vel laoreet vel, luctus at est. Donec enim diam, commodo sit amet pretium egestas, varius et orci. Suspendisse ac lorem quam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean ac purus in lacus dictum vehicula. Aliquam erat volutpat. Donec venenatis elit in tincidunt tincidunt. Phasellus efficitur, odio scelerisque luctus laoreet, sem libero imperdiet erat, congue porttitor lacus libero in sapien. Mauris tincidunt posuere nisi non pellentesque. Donec purus odio, imperdiet nec eros in, tincidunt luctus ex. In ut rhoncus sapien. Quisque hendrerit nunc neque. Maecenas vulputate lacus vel libero tincidunt, sit amet laoreet nisi suscipit.";
    const bmpE = singularValueDecompositionEncrypt(bmp, ipsum);
    downloadBMP(bmpE, "ipsum-encoded.bmp");
    const [bmpD, message] = singularValueDecompositionDecrypt(bmpE);
    downloadBMP(bmpD, "ipsum-decoded.bmp");
    console.log("Decoded:");
    console.log(message);
    return;
    // Refer: algorithms.js
    const encodedImage1 = differentialExpansionEncrypt(bmp, ipsum);
    const encodedImage2 = histogramShiftingEncrypt(bmp);
    const encodedImage3 = singularValueDecompositionEncrypt(bmp, ipsum);
    // Output is in global scope
    image_output = new EncryptedFile(file.name, encodedImage1, encodedImage2, encodedImage3);
    // Enable Convert Button
    enableEncryptButton();
});
// This function handles the Encode/Decode actions
const btnEncrypt = document.getElementById("btn-encrypt");
btnEncrypt.addEventListener('click', function () {
    // Downlaod based on checkbox values
    if (checkbox1 && image_output && checkbox1.checked) {
        downloadBMP(image_output.encryptedImage1, `encrypted1-${image_output.name}`);
    }
    if (checkbox2 && image_output && checkbox2.checked) {
        downloadBMP(image_output.encryptedImage2, `encrypted2-${image_output.name}`);
    }
    if (checkbox3 && image_output && checkbox3.checked) {
        downloadBMP(image_output.encryptedImage3, `encrypted3-${image_output.name}`);
    }
});
