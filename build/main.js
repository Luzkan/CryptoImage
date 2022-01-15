"use strict";
// -------------------------------------------------------------
// Initialization
const DEBUG = true;
// -------------------------------------------------------------
class EncryptedFile {
    constructor(differentialExpansion, histogramShifting, singularValueDecomposition) {
        this.differentialExpansion = differentialExpansion;
        this.histogramShifting = histogramShifting;
        this.singularValueDecomposition = singularValueDecomposition;
    }
    checkMessageValidity() {
        if (!this.differentialExpansion || !this.histogramShifting || !this.singularValueDecomposition)
            return;
        const prinout = (msg1, msg2) => {
            console.log(`Message #1:\n${msg1}`);
            console.log(`Message #2:\n${msg2}`);
        };
        if (this.differentialExpansion.message !== this.histogramShifting.message) {
            prinout(this.differentialExpansion.message, this.histogramShifting.message);
            throw new Error("Differential Expansion and Histogram Shifting have different messages!");
        }
        if (this.differentialExpansion.message !== this.singularValueDecomposition.message) {
            prinout(this.differentialExpansion.message, this.singularValueDecomposition.message);
            throw new Error("Differential Expansion and Singular Value Decomposition have different messages!");
        }
    }
}
class EncryptedDecryptedImage {
    constructor(encrypted, decrypted, message) {
        this.encrypted = encrypted;
        this.decrypted = decrypted;
        this.message = message;
    }
}
class CapacityCounter {
    constructor(label, labelJQ, bytesToWrite) {
        this.currentBytesCapacity = 0;
        this.label = label;
        this.labelJQ = labelJQ;
        this.bytesToWrite = bytesToWrite;
    }
    update(encrypted_message_length) {
        this.label.innerHTML = (this.currentBytesCapacity - encrypted_message_length).toString();
    }
    countTo() {
        if (!inputImageInfo)
            return;
        const getBytesToWriteCapacity = (inputImage) => {
            try {
                return this.bytesToWrite(inputImage);
            }
            catch (e) {
                console.log(e);
                return 0;
            }
        };
        this.currentBytesCapacity = getBytesToWriteCapacity(inputImageInfo); // @ts-ignore
        this.labelJQ.countTo({ from: parseInt(this.label.innerHTML), to: this.currentBytesCapacity - (encryptedText?.length ?? 0) });
    }
}
class Algorithm {
    constructor(counter, methodLabel, checkbox, imageEncoded, imageDecoded) {
        this.counter = counter;
        this.methodLabel = methodLabel;
        this.checkbox = checkbox;
        this.imageEncoded = imageEncoded;
        this.imageDecoded = imageDecoded;
    }
    isCapacityExceeded() {
        return this.counter.currentBytesCapacity - (encryptedText?.length ?? 0) < 0;
    }
    checkWhetherCounterPassedZeroAndHandle() {
        if (this.isCapacityExceeded()) {
            this.methodLabel.classList.add("disabled-download-option");
            this.methodLabel.children[2].innerHTML = "- no capacity";
        }
        else {
            this.methodLabel.classList.remove("disabled-download-option");
            this.methodLabel.children[2].innerHTML = "";
        }
    }
    loadResultsImagesToResultSection(image) {
        if (!image)
            return;
        function makeFullscreenOnClick(image) {
            image.addEventListener('click', function () {
                fullscreenImg.src = image.src;
                fullscreenDiv.style.display = 'flex';
                fullscreenDiv.style.visibility = 'visible';
                fullscreenDiv.style.opacity = '1';
            });
        }
        this.imageEncoded.src = URL.createObjectURL(image.encrypted.toBlob());
        makeFullscreenOnClick(this.imageEncoded);
        this.imageDecoded.src = URL.createObjectURL(image.decrypted.toBlob());
        makeFullscreenOnClick(this.imageDecoded);
    }
    download() {
        if (!this.checkbox.checked)
            return;
        const link = document.createElement('a');
        link.download = this.methodLabel.children[0].innerHTML + ".bmp";
        link.href = this.imageEncoded.src;
        link.click();
    }
}
class InfoCounter {
    constructor(label, labelJQ) {
        this.label = label;
        this.labelJQ = labelJQ;
    }
    countTo() {
        if (!inputImageInfo)
            return; // @ts-ignore
        this.labelJQ.countTo({ from: parseInt(this.label.innerHTML), to: Math.floor(inputImageInfo.fileSize / 1024) });
    }
}
// Globally scoped variables
let encryptedText = null;
let inputImageInfo = null;
let maximumSizeValue = 0;
// -------------------------------------------------------------
// HTML Elements
// Fullscreen
const fullscreenDiv = document.getElementById("fullscreen-div");
const fullscreenImg = document.getElementById("fullscreen-img");
// Encryption Form (ImageInput, Textfield, Button and Tooltip)
const encryptTooltip = document.getElementById("p-encrypt-tooltip");
// -------------------------------------------------------------
// Initialziing Globally Scoped Objects for Algorithms
const diffExp = new Algorithm(new CapacityCounter(document.getElementById("available-diff-exp-counter"), $('#available-diff-exp-counter'), bytesToWriteDE), document.getElementById("method-de-label"), document.getElementById("method-de-checkbox"), document.getElementById("diff-exp-encoded-image"), document.getElementById("diff-exp-decoded-image"));
const histShift = new Algorithm(new CapacityCounter(document.getElementById("available-hist-shift-counter"), $('#available-hist-shift-counter'), bytesToWriteHS), document.getElementById("method-hs-label"), document.getElementById("method-hs-checkbox"), document.getElementById("hist-shift-encoded-image"), document.getElementById("hist-shift-decoded-image"));
const singValDecomp = new Algorithm(new CapacityCounter(document.getElementById("available-sing-val-decomp-counter"), $('#available-sing-val-decomp-counter'), bytesToWriteDE // TODO, change to bytesToWriteSVD
), document.getElementById("method-svd-label"), document.getElementById("method-svd-checkbox"), document.getElementById("sing-val-decomp-encoded-image"), document.getElementById("sing-val-decomp-decoded-image"));
// Info Counters
const imageSize = new InfoCounter(document.getElementById("image-size-counter"), $('#image-size-counter'));
const maximumSize = new InfoCounter(document.getElementById("maximum-size-counter"), $('#maximum-size-counter'));
const decodeSize = new InfoCounter(document.getElementById("decode-size-counter"), $('#decode-size-counter'));
// -------------------------------------------------------------
// User Controls Related Functions
function tryEnableEncryptButton() {
    function enableEncryptButton() {
        if (!encryptBtn || !encryptTooltip)
            return;
        encryptBtn.disabled = false;
        encryptTooltip.classList.add("permamently-transparent");
    }
    if (!inputImageInfo && !encryptedText) {
        encryptTooltip.innerHTML = "Upload an image first and type in text.";
    }
    else if (!inputImageInfo && encryptedText) {
        encryptTooltip.innerHTML = "Upload an image first.";
    }
    else if (inputImageInfo && !encryptedText) {
        encryptTooltip.innerHTML = "Type in encryption text first.";
    }
    else {
        enableEncryptButton();
    }
}
// -------------------------------------------------------------
// Logic
function encryptAndDecrypt(bmp, encrypted_text) {
    function getDifferentialExpansionImages() {
        if (diffExp.isCapacityExceeded())
            return null;
        try {
            const diffExpBMPEncrypted = differentialExpansionEncrypt(bmp, encrypted_text);
            const [diffExpBMPDecrypted, diffExpMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);
            return { encrypted: diffExpBMPEncrypted, decrypted: diffExpBMPDecrypted, message: diffExpMsgDecrypted };
        }
        catch (error) {
            return null;
        }
    }
    function getHistogramShiftingImages() {
        if (histShift.isCapacityExceeded())
            return null;
        try {
            const [histShiftBMPEncrypted, histShiftKeys] = histogramShiftingEncrypt(bmp, encrypted_text);
            const [histShiftBMPDecrypted, histShiftMsgDecrypted] = histogramShiftingDecrypt(histShiftBMPEncrypted, histShiftKeys);
            return { encrypted: histShiftBMPEncrypted, decrypted: histShiftBMPDecrypted, message: histShiftMsgDecrypted };
        }
        catch (error) {
            return null;
        }
    }
    function getSingularValueDecompositionImages() {
        if (singValDecomp.isCapacityExceeded())
            return null;
        try {
            const singValDecompBMPEncrypted = singularValueDecompositionEncrypt(bmp, encrypted_text);
            const [singValDecompBMPDecrypted, singValDecompMsgDecrypted] = singularValueDecompositionDecrypt(singValDecompBMPEncrypted);
            return { encrypted: singValDecompBMPEncrypted, decrypted: singValDecompBMPDecrypted, message: singValDecompMsgDecrypted };
        }
        catch (error) {
            return null;
        }
    }
    return new EncryptedFile(getDifferentialExpansionImages(), getHistogramShiftingImages(), getSingularValueDecompositionImages());
}
// -------------------------------------------------------------
// Actions
const messageTextArea = document.getElementById("crypto-image-message");
messageTextArea.addEventListener('input', (event) => {
    if (event) {
        encryptedText = event.target.value;
    }
    if (typeof encryptedText != "string")
        return;
    function updateCapacityCounters(counters) {
        counters.forEach(counter => counter.update(messageLength));
    }
    function handleDownloadButtonsAvailability(elements) {
        elements.forEach(element => element.checkWhetherCounterPassedZeroAndHandle());
    }
    const messageLength = encryptedText?.length ?? 0;
    maximumSize.label.innerHTML = (maximumSizeValue - messageLength).toString();
    updateCapacityCounters([diffExp.counter, histShift.counter, singValDecomp.counter]);
    handleDownloadButtonsAvailability([diffExp, histShift, singValDecomp]);
    tryEnableEncryptButton();
});
// -------------------------------------------------------------
const originalImageImg = document.getElementById("orignal-image-img");
const inputImg = document.getElementById("form-input-image");
inputImg.addEventListener('input', async (e) => {
    function updateCounters() {
        function updateCapacityCounters(counters) {
            counters.forEach(counter => counter.countTo());
        }
        function updateInfoCounters(counters) {
            counters.forEach(counter => counter.countTo());
        }
        function updateMaximumSizeValue() {
            maximumSizeValue = Math.max(diffExp.counter.currentBytesCapacity, histShift.counter.currentBytesCapacity, singValDecomp.counter.currentBytesCapacity) - (encryptedText?.length ?? 0);
        }
        updateMaximumSizeValue();
        updateCapacityCounters([diffExp.counter, histShift.counter, singValDecomp.counter]);
        updateInfoCounters([imageSize, maximumSize, decodeSize]);
    }
    const inputImage = e.target.files[0];
    inputImageInfo = await BMP.from(inputImage);
    originalImageImg.src = URL.createObjectURL(inputImage);
    updateCounters();
    tryEnableEncryptButton();
});
// -------------------------------------------------------------
const encryptBtn = document.getElementById("btn-encrypt");
encryptBtn.addEventListener("click", function () {
    if (!inputImageInfo || !encryptedText)
        return;
    function loadResultImagesToResultSection(encrypted) {
        diffExp.loadResultsImagesToResultSection(encrypted.differentialExpansion);
        histShift.loadResultsImagesToResultSection(encrypted.histogramShifting);
        singValDecomp.loadResultsImagesToResultSection(encrypted.singularValueDecomposition);
    }
    function displayResultsSection() {
        const resultsSectionDiv = document.getElementById("section-results-div");
        resultsSectionDiv.style.display = "block";
        resultsSectionDiv.style.visibility = "visible";
    }
    function smoothScrollToResultsSection() {
        const imageProcessingCompletedHeading = document.getElementById("results-section-scroll-hook");
        imageProcessingCompletedHeading.scrollIntoView({ behavior: 'smooth' });
    }
    function downloadCheckboxSelectedImages(elements) {
        elements.forEach(element => element.download());
    }
    const encryptedFile = encryptAndDecrypt(inputImageInfo, encryptedText);
    try {
        encryptedFile.checkMessageValidity();
    }
    catch (error) {
        console.log(error);
    }
    loadResultImagesToResultSection(encryptedFile);
    displayResultsSection();
    smoothScrollToResultsSection();
    downloadCheckboxSelectedImages([diffExp, histShift, singValDecomp]);
});
// -------------------------------------------------------------
// Navigation Functions
function smoothScrollToTopAfterReload() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}
// -------------------------------------------------------------
// Display Related Functions
function makeHiddenOnClick(element) {
    element.addEventListener('click', function () {
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
    });
}
// -------------------------------------------------------------
// After Page Load Actions
smoothScrollToTopAfterReload();
makeHiddenOnClick(fullscreenDiv);
