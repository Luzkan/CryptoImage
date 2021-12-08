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
let image_output = null;
let encrypted_text = null;
let bmp = null;
let current_bytes_to_write_de = 0;
// -------------------------------------------------------------
// HTML Elements
// Method Checkboxes
const checkbox1 = document.getElementById("method-1-checkbox");
const checkbox2 = document.getElementById("method-2-checkbox");
const checkbox3 = document.getElementById("method-3-checkbox");
// Image Original
const originalImageDiv = document.getElementById("original-image-div");
const originalImageImg = document.getElementById("orignal-image-img");
// Fullscreen
const fullscreenDiv = document.getElementById("fullscreen-div");
const fullscreenImg = document.getElementById("fullscreen-img");
// Immges Encoded
const diffExpEncodedImg = document.getElementById("diff-exp-encoded-image");
const histShiftEncodedImg = document.getElementById("hist-shift-encoded-image");
const singValDecompEncodedImg = document.getElementById("sing-val-decomp-encoded-image");
// Immges Decoded
const diffExpDecodedImg = document.getElementById("diff-exp-decoded-image");
const histShiftDecodedImg = document.getElementById("hist-shift-decoded-image");
const singValDecompDecodedImg = document.getElementById("sing-val-decomp-decoded-image");
// Label Counters
const imageSizeCounterLabel = document.getElementById("image-size-counter");
const availableSizeCounterLabel = document.getElementById("available-size-counter");
const decodeSizeCounterLabel = document.getElementById("decode-size-counter");
// @ts-ignore
const imageSizeCounterLabelJQ = $('#image-size-counter'); // @ts-ignore
const availableSizeCounterLabelJQ = $('#available-size-counter'); // @ts-ignore
const decodeSizeCounterLabelJQ = $('#decode-size-counter');
// Encryption Form (ImageInput, Textfield, Button and Tooltip)
const inputImg = document.getElementById("form-input-image");
const messageTextarea = document.getElementById("crypto-image-message");
const encryptBtn = document.getElementById("btn-encrypt");
const encryptTooltip = document.getElementById("p-encrypt-tooltip");
// -------------------------------------------------------------
// Navigation Functions
function smoothScrollToTopAfterReload() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}
function smoothScrollToResultsSection() {
    const imageProcessingCompletedHeading = document.getElementById("results-section-scroll-hook");
    imageProcessingCompletedHeading.scrollIntoView({ behavior: 'smooth' });
}
// -------------------------------------------------------------
// Display Related Functions
function makeFullscreenOnClick(image) {
    image.addEventListener('click', function () {
        fullscreenImg.src = image.src;
        fullscreenDiv.style.display = 'flex';
        fullscreenDiv.style.visibility = 'visible';
        fullscreenDiv.style.opacity = '1';
    });
}
function makeHiddenOnClick(element) {
    element.addEventListener('click', function () {
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
    });
}
function displayResultsSection() {
    const resultsSectionDiv = document.getElementById("section-results-div");
    resultsSectionDiv.style.display = "block";
    resultsSectionDiv.style.visibility = "visible";
}
// -------------------------------------------------------------
// User Controls Related Functions
function tryEnableEncryptButton() {
    if (!bmp && !encrypted_text) {
        encryptTooltip.innerHTML = "Upload an image first and type in text.";
    }
    else if (!bmp && encrypted_text) {
        encryptTooltip.innerHTML = "Upload an image first.";
    }
    else if (bmp && !encrypted_text) {
        encryptTooltip.innerHTML = "Type in encryption text first.";
    }
    else {
        enableEncryptButton();
    }
}
function enableEncryptButton() {
    // Enables the encrypt button if the textfield is not empty
    if (encryptBtn && encryptTooltip) {
        encryptBtn.disabled = false;
        encryptTooltip.classList.add("permamently-transparent");
    }
}
function updateCounters(bmp) {
    current_bytes_to_write_de = bytesToWriteDE(bmp);
    const target_bytes_number = current_bytes_to_write_de - (encrypted_text?.length ?? 0);
    imageSizeCounterLabelJQ.countTo({ from: parseInt(imageSizeCounterLabel.innerHTML), to: Math.floor(bmp.fileSize / 1024) });
    availableSizeCounterLabelJQ.countTo({ from: parseInt(availableSizeCounterLabel.innerHTML), to: target_bytes_number });
    decodeSizeCounterLabelJQ.countTo({ from: parseInt(decodeSizeCounterLabel.innerHTML), to: target_bytes_number });
}
// -------------------------------------------------------------
// Misc Functions
function loadResultImagesToResultSection(image_output) {
    diffExpEncodedImg.src = URL.createObjectURL(image_output.diffExpBMPEncrypted.toBlob());
    makeFullscreenOnClick(diffExpEncodedImg);
    histShiftEncodedImg.src = URL.createObjectURL(image_output.diffExpBMPEncrypted.toBlob());
    // TODO histShiftEncodedImg.src = URL.createObjectURL( image_output.histShiftBMPEncrypted.toBlob() );
    makeFullscreenOnClick(histShiftEncodedImg);
    singValDecompEncodedImg.src = URL.createObjectURL(image_output.singValDecompBMPEncrypted.toBlob());
    makeFullscreenOnClick(singValDecompEncodedImg);
    diffExpDecodedImg.src = URL.createObjectURL(image_output.diffExpBMPDecrypted.toBlob());
    makeFullscreenOnClick(diffExpDecodedImg);
    histShiftDecodedImg.src = URL.createObjectURL(image_output.diffExpBMPDecrypted.toBlob());
    // TODO histShiftDecodedImg.src = URL.createObjectURL( image_output.histShiftBMPDecrypted.toBlob() );
    makeFullscreenOnClick(histShiftDecodedImg);
    singValDecompDecodedImg.src = URL.createObjectURL(image_output.singValDecompBMPDecrypted.toBlob());
    makeFullscreenOnClick(singValDecompDecodedImg);
}
function deletePreviouslyAddedDisplayImage() {
    var displayImage = document.getElementsByClassName("display-original-img");
    Array.from(displayImage).forEach(function (element) { element.remove(); });
}
// -------------------------------------------------------------
// Logic
function encryptAndDecrypt(bmp, encrypted_text) {
    const diffExpBMPEncrypted = differentialExpansionEncrypt(bmp, encrypted_text);
    const [diffExpBMPDecrypted, diffExpMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);
    // TODO const histShiftBMPEncrypted = histogramShiftingEncrypt(bmp, encrypted_text);
    // TODO const [histShiftBMPDecrypted, histShiftMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);
    const singValDecompBMPEncrypted = singularValueDecompositionEncrypt(bmp, encrypted_text);
    const [singValDecompBMPDecrypted, singValDecompMsgDecrypted] = singularValueDecompositionDecrypt(singValDecompBMPEncrypted);
    // TODO if (!(diffExpMsgDecrypted === histShiftMsgDecrypted) || !(diffExpMsgDecrypted === singValDecompMsgDecrypted)) { console.log('Decryption Error!');}
    return new EncryptedFile("output", diffExpMsgDecrypted, diffExpBMPEncrypted, null, // TODO histShiftBMPEncrypted,
    singValDecompBMPEncrypted, diffExpBMPDecrypted, null, // TODO histShiftBMPDecrypted
    singValDecompBMPDecrypted);
}
// -------------------------------------------------------------
// Actions
messageTextarea.addEventListener('input', (event) => {
    if (event) {
        encrypted_text = event.target.value;
    }
    if (encrypted_text) {
        availableSizeCounterLabel.innerHTML = (current_bytes_to_write_de - encrypted_text?.length).toString();
    }
    tryEnableEncryptButton();
});
inputImg.addEventListener('input', async (e) => {
    // Retrieve Imagefile
    const originalImage = e.target.files[0];
    // Decode & Create Pixel 3D Array
    bmp = await BMP.from(originalImage);
    originalImageImg.src = URL.createObjectURL(originalImage);
    updateCounters(bmp);
    tryEnableEncryptButton();
});
encryptBtn.addEventListener("click", function () {
    if (!bmp || !encrypted_text) {
        return;
    }
    image_output = encryptAndDecrypt(bmp, encrypted_text);
    loadResultImagesToResultSection(image_output);
    displayResultsSection();
    smoothScrollToResultsSection();
});
encryptBtn.addEventListener('click', function () {
    if (checkbox1 && image_output && checkbox1.checked) {
        downloadBMP(image_output.diffExpBMPEncrypted, `diff_exp_encoded_${image_output.name}`);
    }
    // TODO if (checkbox2 && image_output && checkbox2.checked) { downloadBMP(image_output.histShiftBMPEncrypted, `hist_shift_encoded_${ image_output.name }`); }
    if (checkbox3 && image_output && checkbox3.checked) {
        downloadBMP(image_output.singValDecompBMPEncrypted, `sing_val_decomp_encoded_${image_output.name}`);
    }
    if (checkbox1 && image_output && checkbox1.checked) {
        downloadBMP(image_output.diffExpBMPDecrypted, `diff_exp_decoded_${image_output.name}`);
    }
    // TODO if (checkbox2 && image_output && checkbox2.checked) { downloadBMP(image_output.histShiftBMPDecrypted, `hist_shift_decoded_${ image_output.name }`); }
    if (checkbox3 && image_output && checkbox3.checked) {
        downloadBMP(image_output.singValDecompBMPDecrypted, `sing_val_decomp_decoded_${image_output.name}`);
    }
    if (image_output) {
        console.log(`Encoded / Decoded:\n${image_output.message}`);
    }
});
// After Page Load
smoothScrollToTopAfterReload();
makeHiddenOnClick(fullscreenDiv);
