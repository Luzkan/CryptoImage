"use strict";
// -------------------------------------------------------------
// Classes
class EncryptedFile {
    constructor(differentialExpansion, histogramShifting, singularValueDecomposition) {
        this.differentialExpansion = differentialExpansion;
        this.histogramShifting = histogramShifting;
        this.singularValueDecomposition = singularValueDecomposition;
    }
    getImages() {
        return [
            this.differentialExpansion,
            this.histogramShifting,
            this.singularValueDecomposition
        ].filter(x => x !== null);
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
class CounterCapacity {
    constructor(label, labelJQ, bytesToWrite, currentBytesCapacity = 0) {
        this.label = label;
        this.labelJQ = labelJQ;
        this.bytesToWrite = bytesToWrite;
        this.currentBytesCapacity = currentBytesCapacity;
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
class CounterInformational {
    constructor(label, labelJQ) {
        this.label = label;
        this.labelJQ = labelJQ;
    }
    countTo(topValue) {
        if (!inputImageInfo)
            return; // @ts-ignore
        this.labelJQ.countTo({ from: parseInt(this.label.innerHTML), to: topValue });
    }
}
class AlgorithmElements {
    constructor(counter, methodLabel, checkbox, imageContainer, imageEncoded, imageDecoded) {
        this.counter = counter;
        this.methodLabel = methodLabel;
        this.checkbox = checkbox;
        this.imageContainer = imageContainer;
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
        this.imageEncoded.src = URL.createObjectURL(image.encrypted.toBlob());
        this.imageDecoded.src = URL.createObjectURL(image.decrypted.toBlob());
        userFlowHandler.fullscreen.makeFullscreenOnClick(this.imageEncoded);
        userFlowHandler.fullscreen.makeFullscreenOnClick(this.imageDecoded);
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
class Algorithms {
    constructor(differentialExpansion, histogramShifting, singularValueDecomposition) {
        this.differentialExpansion = differentialExpansion;
        this.histogramShifting = histogramShifting;
        this.singularValueDecomposition = singularValueDecomposition;
    }
    getCounters() {
        return [
            this.differentialExpansion.counter,
            this.histogramShifting.counter,
            this.singularValueDecomposition.counter,
        ];
    }
    getAlgorithmElements() {
        return [
            this.differentialExpansion,
            this.histogramShifting,
            this.singularValueDecomposition,
        ];
    }
    downloadCheckboxSelectedImages() {
        this.getAlgorithmElements().forEach(algorithm => algorithm.download());
    }
    loadResultImagesToResultSection(encrypted) {
        this.differentialExpansion.loadResultsImagesToResultSection(encrypted.differentialExpansion);
        this.histogramShifting.loadResultsImagesToResultSection(encrypted.histogramShifting);
        this.singularValueDecomposition.loadResultsImagesToResultSection(encrypted.singularValueDecomposition);
    }
    setupDivsBasedOnEncryptions(encrypted) {
        const number_of_encrypted_files = encrypted.getImages().length;
        const number_of_encrypted_files_to_col_sm_map = {
            0: "",
            1: "col-md-12",
            2: "col-md-6",
            3: "col-md-4"
        };
        const columns = ["col-md-12", "col-md-6", "col-md-4", "hidden-div"];
        function setupDiv(encryptedDecryptedImage, algorithmElements) {
            if (!encryptedDecryptedImage) {
                algorithmElements.imageContainer.classList.add("hidden-div");
                return;
            }
            columns.forEach(column => { algorithmElements.imageContainer.classList.remove(column); });
            algorithmElements.imageContainer.classList.add(number_of_encrypted_files_to_col_sm_map[number_of_encrypted_files]);
        }
        setupDiv(encrypted.differentialExpansion, this.differentialExpansion);
        setupDiv(encrypted.histogramShifting, this.histogramShifting);
        setupDiv(encrypted.singularValueDecomposition, this.singularValueDecomposition);
    }
}
class Fullscreen {
    constructor(image, div) {
        this.image = image;
        this.div = div;
    }
    replaceFullscreenImage(newImage) {
        this.image.src = newImage.src;
    }
    makeFullscreenOnClick(newImage) {
        const that = this;
        newImage.addEventListener('click', function () {
            that.replaceFullscreenImage(newImage);
            that.div.style.display = 'flex';
            that.div.style.visibility = 'visible';
            that.div.style.opacity = '1';
        });
    }
    makeFullscreenDivHiddenOnClick() {
        const that = this;
        this.div.addEventListener('click', function () {
            that.div.style.opacity = '0';
            that.div.style.visibility = 'hidden';
        });
    }
}
class UserFlowHandler {
    constructor(originalImage, formInputImage, encryptButton, messageTextArea, encryptTooltip, fullscreen) {
        this.originalImage = originalImage;
        this.formInputImage = formInputImage;
        this.encryptButton = encryptButton;
        this.messageTextArea = messageTextArea;
        this.encryptTooltip = encryptTooltip;
        this.fullscreen = fullscreen;
    }
    smoothScrollToTopAfterReload() {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    tryEnableEncryptButton() {
        const enableEncryptButton = () => {
            this.encryptButton.disabled = false;
            this.encryptTooltip.classList.add("permamently-transparent");
        };
        if (!inputImageInfo && !encryptedText) {
            this.encryptTooltip.innerHTML = "Upload an image first and type in text.";
        }
        else if (!inputImageInfo && encryptedText) {
            this.encryptTooltip.innerHTML = "Upload an image first.";
        }
        else if (inputImageInfo && !encryptedText) {
            this.encryptTooltip.innerHTML = "Type in encryption text first.";
        }
        else {
            enableEncryptButton();
        }
    }
}
// -------------------------------------------------------------
// Initializing
const userFlowHandler = new UserFlowHandler(document.getElementById("img-preview-original-image"), document.getElementById("input-form-image"), document.getElementById("btn-encrypt"), document.getElementById("textarea-crypto-message"), document.getElementById("p-form-tooltip"), new Fullscreen(document.getElementById("img-fullscreen"), document.getElementById("div-fullscreen")));
// Globally scoped variables
let encryptedText = null;
let inputImageInfo = null;
let maximumSizeValue = 0;
const algorithms = new Algorithms(new AlgorithmElements(new CounterCapacity(document.getElementById("available-diff-exp-counter"), $('#available-diff-exp-counter'), bytesToWriteDE), document.getElementById("method-de-label"), document.getElementById("method-de-checkbox"), document.getElementById("method-de-div"), document.getElementById("method-de-encoded-image"), document.getElementById("method-de-decoded-image")), new AlgorithmElements(new CounterCapacity(document.getElementById("available-hist-shift-counter"), $('#available-hist-shift-counter'), bytesToWriteHS), document.getElementById("method-hs-label"), document.getElementById("method-hs-checkbox"), document.getElementById("method-hs-div"), document.getElementById("method-hs-encoded-image"), document.getElementById("method-hs-decoded-image")), new AlgorithmElements(new CounterCapacity(document.getElementById("available-sing-val-decomp-counter"), $('#available-sing-val-decomp-counter'), bytesToWriteDE // TODO, change to bytesToWriteSVD
), document.getElementById("method-svd-label"), document.getElementById("method-svd-checkbox"), document.getElementById("method-svd-div"), document.getElementById("method-svd-encoded-image"), document.getElementById("method-svd-decoded-image")));
// Info Counters
const imageSize = new CounterInformational(document.getElementById("image-size-counter"), $('#image-size-counter'));
const maximumSize = new CounterInformational(document.getElementById("maximum-size-counter"), $('#maximum-size-counter'));
const decodeSize = new CounterInformational(document.getElementById("decode-size-counter"), $('#decode-size-counter'));
// -------------------------------------------------------------
// Logic
function encryptAndDecrypt(bmp, encrypted_text) {
    function getDifferentialExpansionImages() {
        if (algorithms.differentialExpansion.isCapacityExceeded())
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
        if (algorithms.histogramShifting.isCapacityExceeded())
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
        if (algorithms.singularValueDecomposition.isCapacityExceeded())
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
userFlowHandler.messageTextArea.addEventListener('input', (event) => {
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
    console.log(maximumSizeValue);
    const messageLength = encryptedText?.length ?? 0;
    maximumSize.label.innerHTML = (maximumSizeValue - messageLength).toString();
    updateCapacityCounters(algorithms.getCounters());
    handleDownloadButtonsAvailability(algorithms.getAlgorithmElements());
    userFlowHandler.tryEnableEncryptButton();
});
// -------------------------------------------------------------
userFlowHandler.formInputImage.addEventListener('input', async (e) => {
    function updateCounters() {
        function updateCapacityCounters(counters) {
            counters.forEach(counter => counter.countTo());
        }
        function updateInfoCounters() {
            if (!inputImageInfo)
                return;
            imageSize.countTo(inputImageInfo.fileSize / 1024);
            maximumSize.countTo(maximumSizeValue);
            decodeSize.countTo(inputImageInfo.fileSize / 1024);
        }
        function updateMaximumSizeValue() {
            const counterValues = algorithms.getCounters().map(counter => counter.currentBytesCapacity);
            maximumSizeValue = Math.max(...counterValues) - (encryptedText?.length ?? 0);
            console.log("!!!", maximumSizeValue);
        }
        updateCapacityCounters(algorithms.getCounters());
        updateMaximumSizeValue();
        updateInfoCounters();
    }
    const inputImage = e.target.files[0];
    inputImageInfo = await BMP.from(inputImage);
    userFlowHandler.originalImage.src = URL.createObjectURL(inputImage);
    updateCounters();
    userFlowHandler.tryEnableEncryptButton();
});
// -------------------------------------------------------------
userFlowHandler.encryptButton.addEventListener("click", function () {
    if (!inputImageInfo || !encryptedText)
        return;
    function displayResultsSection() {
        const resultsSectionDiv = document.getElementById("section-results-div");
        resultsSectionDiv.style.display = "block";
        resultsSectionDiv.style.visibility = "visible";
    }
    function smoothScrollToResultsSection() {
        const imageProcessingCompletedHeading = document.getElementById("results-section-scroll-hook");
        imageProcessingCompletedHeading.scrollIntoView({ behavior: 'smooth' });
    }
    const encryptedFile = encryptAndDecrypt(inputImageInfo, encryptedText);
    try {
        encryptedFile.checkMessageValidity();
    }
    catch (error) {
        console.log(error);
    }
    algorithms.loadResultImagesToResultSection(encryptedFile);
    algorithms.setupDivsBasedOnEncryptions(encryptedFile);
    displayResultsSection();
    smoothScrollToResultsSection();
    algorithms.downloadCheckboxSelectedImages();
});
// -------------------------------------------------------------
// After Page Load Actions
userFlowHandler.fullscreen.makeFullscreenDivHiddenOnClick();
userFlowHandler.smoothScrollToTopAfterReload();
