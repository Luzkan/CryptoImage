"use strict";
// -------------------------------------------------------------
// Initialization
const DEBUG = true;
// -------------------------------------------------------------
// Data Storages
// Class storing the variables for the image
class EncryptedFile {
    constructor(name, message, diffExpBMPEncrypted, histShiftBMPEncrypted, singValDecompBMPEncrypted, diffExpBMPDecrypted, histShiftBMPDecrypted, singValDecompBMPDecrypted) {
        this.name = name;
        this.message = message;
        this.diffExpBMPEncrypted = diffExpBMPEncrypted;
        this.histShiftBMPEncrypted = histShiftBMPEncrypted;
        this.singValDecompBMPEncrypted = singValDecompBMPEncrypted;
        this.diffExpBMPDecrypted = diffExpBMPDecrypted;
        this.histShiftBMPDecrypted = histShiftBMPDecrypted;
        this.singValDecompBMPDecrypted = singValDecompBMPDecrypted;
    }
}
// Globally scoped variables
let image_output = null; // EncryptedFile Holder
let encrypted_text = null; // Textfield Text Value
let bmp = null; // BMP Holder
// -------------------------------------------------------------
// HTML Elements
// Method Checkboxes
const checkbox1 = document.getElementById("method-1-checkbox");
const checkbox2 = document.getElementById("method-2-checkbox");
const checkbox3 = document.getElementById("method-3-checkbox");
// Images
const originalImageDiv = document.getElementById("original-image");
const method1ImageDiv = document.getElementById("method1-image");
const method2ImageDiv = document.getElementById("method2-image");
const method3ImageDiv = document.getElementById("method3-image");
// Label Counters
const imageSizeCounterLabel = document.getElementById("image-size-counter");
const availableSizeCounterLabel = document.getElementById("availalbe-size-counter");
const decodeSizeCounterLabel = document.getElementById("decode-size-counter");
// Encryption Form (ImageInput, Textfield, Button and Tooltip)
const inputImage = document.getElementById("form-input-image");
const textareaMessage = document.getElementById("crypto-image-message");
const btnEncrypt = document.getElementById("btn-encrypt");
const pEncryptTooltip = document.getElementById("btn-encrypt-tooltip");
// -------------------------------------------------------------
// Misc Functions
function tryEnableEncryptButton() {
    if (!bmp || !encrypted_text) {
        pEncryptTooltip.innerHTML = "Upload an image first.";
    }
    else if (!bmp) {
        pEncryptTooltip.innerHTML = "Upload an image first.";
    }
    else if (!encrypted_text) {
        pEncryptTooltip.innerHTML = "Type in encryption text first.";
    }
    else {
        enableEncryptButton();
    }
}
function enableEncryptButton() {
    // Enables the encrypt button if the textfield is not empty
    if (btnEncrypt && pEncryptTooltip) {
        btnEncrypt.disabled = false;
        pEncryptTooltip.classList.add("permamently-transparent");
    }
}
// -------------------------------------------------------------
// Logic
function encryptAndDecrypt(bmp, encrypted_text) {
    const diffExpBMPEncrypted = differentialExpansionEncrypt(bmp, encrypted_text);
    const [diffExpBMPDecrypted, diffExpMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);
    // TODO
    // const histShiftBMPEncrypted = histogramShiftingEncrypt(bmp, encrypted_text);
    // const [histShiftBMPDecrypted, histShiftMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);
    // TODO
    // const singValDecompBMPEncrypted = singularValueDecompositionEncrypt(bmp, encrypted_text);
    // const [singValDecompBMPDecrypted, singValDecompMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);
    // TODO
    // if (!(diffExpMsgDecrypted === histShiftMsgDecrypted) || !(diffExpMsgDecrypted === singValDecompMsgDecrypted)) { console.log('Decryption Error!');}
    return new EncryptedFile("output", diffExpMsgDecrypted, diffExpBMPEncrypted, null, null, diffExpBMPDecrypted, null, null);
}
// -------------------------------------------------------------
// Actions
textareaMessage.addEventListener('input', (event) => {
    if (event) {
        encrypted_text = event.target.value;
    }
    if (DEBUG) {
        console.log(encrypted_text);
    }
    tryEnableEncryptButton();
});
inputImage.addEventListener('input', async (e) => {
    // Retrieve Imagefile
    const originalImage = e.target.files[0];
    // Decode & Create Pixel 3D Array
    bmp = await BMP.from(originalImage);
    // Loading Original Image into Website
    loadImage(originalImage, function (img) { originalImageDiv.appendChild(img); }, { maxWidth: 1100 });
    // Attempt to enable the encrypt button
    tryEnableEncryptButton();
    if (DEBUG) {
        console.log(bmp);
        console.log(`# Capacity Ascii Letters: ${bytesToWriteDE(bmp)}`);
    }
});
btnEncrypt.addEventListener("click", function () {
    if (!bmp || !encrypted_text) {
        return;
    }
    image_output = encryptAndDecrypt(bmp, encrypted_text);
    loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img) { method1ImageDiv.appendChild(img); }, { maxWidth: 300 });
    loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img) { method2ImageDiv.appendChild(img); }, { maxWidth: 300 });
    loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img) { method3ImageDiv.appendChild(img); }, { maxWidth: 300 });
});
btnEncrypt.addEventListener('click', function () {
    if (checkbox1 && image_output && checkbox1.checked) {
        downloadBMP(image_output.diffExpBMPEncrypted, `diff_exp_${image_output.name}`);
    }
    // TODO
    // if (checkbox2 && image_output && checkbox2.checked) { downloadBMP(image_output.histShiftBMPEncrypted, `hist_shift_${ image_output.name }`); }
    // if (checkbox3 && image_output && checkbox3.checked) { downloadBMP(image_output.singValDecompBMPEncrypted, `sing_val_decomp_${ image_output.name }`); }
    if (DEBUG && checkbox3 && image_output && checkbox3.checked) {
        downloadBMP(image_output.diffExpBMPDecrypted, "`diff_exp_decoded.bmp");
    }
    // TODO
    // if (DEBUG && checkbox3 && image_output && checkbox3.checked) { downloadBMP(image_output.histShiftBMPDecrypted, "hist_shift_decoded.bmp"); }
    // if (DEBUG && checkbox3 && image_output && checkbox3.checked) { downloadBMP(image_output.singValDecompBMPDecrypted, "sing_val_decomp_decoded.bmp"); }
    if (DEBUG && image_output) {
        console.log("Decoded:");
        console.log(image_output.message);
    }
});
