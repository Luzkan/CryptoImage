// -------------------------------------------------------------
// Initialization

const DEBUG = true

// -------------------------------------------------------------

class EncryptedFile {
  constructor(
    public readonly differentialExpansion: EncryptedDecryptedImage | null,
    public readonly histogramShifting: EncryptedDecryptedImage | null,
    public readonly singularValueDecomposition: EncryptedDecryptedImage | null,
  ) { }

  checkMessageValidity() {
    if (!this.differentialExpansion || !this.histogramShifting || !this.singularValueDecomposition) return
    const prinout = (msg1: string, msg2: string) => {
      console.log(`Message #1:\n${msg1}`);
      console.log(`Message #2:\n${msg2}`);
    }
    if (this.differentialExpansion.message !== this.histogramShifting.message) {
      prinout(this.differentialExpansion.message, this.histogramShifting.message);
      throw new Error("Differential Expansion and Histogram Shifting have different messages!")
    }
    if (this.differentialExpansion.message !== this.singularValueDecomposition.message) {
      prinout(this.differentialExpansion.message, this.singularValueDecomposition.message);
      throw new Error("Differential Expansion and Singular Value Decomposition have different messages!")
    }
  }
}

class EncryptedDecryptedImage {
  constructor(
    public readonly encrypted: BMP,
    public readonly decrypted: BMP,
    public readonly message: string
  ) { }
}

class CapacityCounter {
  label: HTMLSpanElement;
  labelJQ: any;
  bytesToWrite: (bmp: BMP) => number;
  currentBytesCapacity: number = 0;
 
  constructor(label: HTMLSpanElement, labelJQ: any, bytesToWrite: (bmp: BMP) => number) {
    this.label = label;
    this.labelJQ = labelJQ;
    this.bytesToWrite = bytesToWrite;
  }

  update(encrypted_message_length: number): void {
    this.label.innerHTML = (this.currentBytesCapacity-encrypted_message_length).toString()
  }

  countTo(): void {
    if (!inputImageInfo) return
    const getBytesToWriteCapacity = (inputImage: BMP): number => {
      try { return this.bytesToWrite(inputImage); } catch (e) { console.log(e); return 0 }
    }
    this.currentBytesCapacity = getBytesToWriteCapacity(inputImageInfo);
    this.labelJQ.countTo({from: parseInt(this.label.innerHTML), to: this.currentBytesCapacity - (encryptedText?.length ?? 0)});
  }
}

class Algorithm {
  counter: CapacityCounter;
  methodLabel: HTMLLabelElement;
  checkbox: HTMLInputElement;
  imageEncoded: HTMLImageElement;
  imageDecoded: HTMLImageElement;

  constructor(counter: CapacityCounter,
              methodLabel: HTMLLabelElement,
              checkbox: HTMLInputElement,
              imageEncoded: HTMLImageElement,
              imageDecoded: HTMLImageElement) {
    this.counter = counter;
    this.methodLabel = methodLabel;
    this.checkbox = checkbox;
    this.imageEncoded = imageEncoded;
    this.imageDecoded = imageDecoded;
  }
  
  isCapacityExceeded(): boolean {
    return this.counter.currentBytesCapacity - (encryptedText?.length ?? 0) < 0;
  }

  checkWhetherCounterPassedZeroAndHandle() {
    if (this.isCapacityExceeded()) {
      this.methodLabel.classList.add("disabled-download-option");
      this.methodLabel.children[2].innerHTML = "- no capacity";
    } else {
      this.methodLabel.classList.remove("disabled-download-option");
      this.methodLabel.children[2].innerHTML = "";
    }
  }

  loadResultsImagesToResultSection(image: EncryptedDecryptedImage | null) {
    if (!image) return

    function makeFullscreenOnClick(image: HTMLImageElement) {
      image.addEventListener('click', function() {
        fullscreenImg.src = image.src;
        fullscreenDiv.style.display = 'flex';
        fullscreenDiv.style.visibility = 'visible';
        fullscreenDiv.style.opacity = '1';
      });
    }

    this.imageEncoded.src = URL.createObjectURL( image.encrypted.toBlob() );
    makeFullscreenOnClick(this.imageEncoded);
    this.imageDecoded.src = URL.createObjectURL( image.decrypted.toBlob() );
    makeFullscreenOnClick(this.imageDecoded);
  }

  download() {
    if (!this.checkbox.checked) return
    const link = document.createElement('a');
    link.download = this.methodLabel.children[0].innerHTML + ".bmp";
    link.href = this.imageEncoded.src;
    link.click();
  }
}

class InfoCounter {
  label: HTMLSpanElement;
  labelJQ: any;

  constructor(label: HTMLSpanElement, labelJQ: any) {
    this.label = label;
    this.labelJQ = labelJQ;
  }

  countTo(): void {
    if (!inputImageInfo) return
    this.labelJQ.countTo({from: parseInt(this.label.innerHTML), to: Math.floor(inputImageInfo.fileSize/1024)});
  }
}

// Globally scoped variables
let encryptedText: string | null = null;
let inputImageInfo: BMP | null = null;
let maximumSizeValue: number = 0;


// -------------------------------------------------------------
// HTML Elements

// Fullscreen
const fullscreenDiv = document.getElementById("fullscreen-div") as HTMLDivElement;
const fullscreenImg = document.getElementById("fullscreen-img") as HTMLImageElement;

// Encryption Form (ImageInput, Textfield, Button and Tooltip)
const encryptTooltip = document.getElementById("p-encrypt-tooltip") as HTMLParagraphElement;

// Counters (JQuery Getter)
// @ts-ignore
const availableSizeDiffExpCounterLabelJQ = $('#available-diff-exp-counter')
// @ts-ignore
const availableSizeHistShiftCounterLabelJQ = $('#available-hist-shift-counter')
// @ts-ignore
const availableSizeSingValDecompCounterLabelJQ = $('#available-sing-val-decomp-counter')
// @ts-ignore
const imageSizeCounterLabelJQ = $('#image-size-counter')
// @ts-ignore
const maximumSizeCounterLabelJQ = $('#maximum-size-counter')
// @ts-ignore
const decodeSizeCounterLabelJQ = $('#decode-size-counter')

// -------------------------------------------------------------
// Initialziing Globally Scoped Objects for Algorithms

const diffExp = new Algorithm(
  new CapacityCounter(
    document.getElementById("available-diff-exp-counter") as HTMLSpanElement,
    availableSizeDiffExpCounterLabelJQ as any,
    bytesToWriteDE
  ),
  document.getElementById("method-de-label") as HTMLLabelElement,
  document.getElementById("method-de-checkbox") as HTMLInputElement,
  document.getElementById("diff-exp-encoded-image") as HTMLImageElement,
  document.getElementById("diff-exp-decoded-image") as HTMLImageElement
);

const histShift = new Algorithm(
  new CapacityCounter(
    document.getElementById("available-hist-shift-counter") as HTMLSpanElement,
    availableSizeHistShiftCounterLabelJQ as any,
    bytesToWriteHS
  ),
  document.getElementById("method-hs-label") as HTMLLabelElement,
  document.getElementById("method-hs-checkbox") as HTMLInputElement,
  document.getElementById("hist-shift-encoded-image") as HTMLImageElement,
  document.getElementById("hist-shift-decoded-image") as HTMLImageElement
);

const singValDecomp = new Algorithm(
  new CapacityCounter(
    document.getElementById("available-sing-val-decomp-counter") as HTMLSpanElement,
    availableSizeSingValDecompCounterLabelJQ as any,
    bytesToWriteDE  // TODO, change to bytesToWriteSVD
  ),
  document.getElementById("method-svd-label") as HTMLLabelElement,
  document.getElementById("method-svd-checkbox") as HTMLInputElement,
  document.getElementById("sing-val-decomp-encoded-image") as HTMLImageElement,
  document.getElementById("sing-val-decomp-decoded-image") as HTMLImageElement
);

// Info Counters
const imageSize: InfoCounter = new InfoCounter(
  document.getElementById("image-size-counter") as HTMLSpanElement,
  imageSizeCounterLabelJQ
);

const maximumSize: InfoCounter = new InfoCounter(
  document.getElementById("maximum-size-counter") as HTMLSpanElement,
  maximumSizeCounterLabelJQ
);

const decodeSize: InfoCounter = new InfoCounter(
  document.getElementById("decode-size-counter") as HTMLSpanElement,
  decodeSizeCounterLabelJQ
);


// -------------------------------------------------------------
// User Controls Related Functions

function tryEnableEncryptButton() {
  function enableEncryptButton() {
    if (!encryptBtn || !encryptTooltip) return
    encryptBtn.disabled = false;
    encryptTooltip.classList.add("permamently-transparent");
  }

  if (!inputImageInfo && !encryptedText) { encryptTooltip.innerHTML = "Upload an image first and type in text."; }
  else if (!inputImageInfo && encryptedText) { encryptTooltip.innerHTML = "Upload an image first."; }
  else if (inputImageInfo && !encryptedText) { encryptTooltip.innerHTML = "Type in encryption text first."; }
  else { enableEncryptButton() }
}

// -------------------------------------------------------------
// Logic

function encryptAndDecrypt(bmp: BMP, encrypted_text: string): EncryptedFile {

  function getDifferentialExpansionImages(): EncryptedDecryptedImage | null {
    if (diffExp.isCapacityExceeded()) return null
    try {
      const diffExpBMPEncrypted: BMP = differentialExpansionEncrypt(bmp, encrypted_text);
      const [diffExpBMPDecrypted, diffExpMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);
      return {encrypted: diffExpBMPEncrypted, decrypted: diffExpBMPDecrypted, message: diffExpMsgDecrypted }
    } catch (error) {
      return null
    }
  }

  function getHistogramShiftingImages(): EncryptedDecryptedImage | null {
    if (histShift.isCapacityExceeded()) return null
    try {
      const [histShiftBMPEncrypted, histShiftKeys] = histogramShiftingEncrypt(bmp, encrypted_text);
      const [histShiftBMPDecrypted, histShiftMsgDecrypted] = histogramShiftingDecrypt(histShiftBMPEncrypted, histShiftKeys);
      return {encrypted: histShiftBMPEncrypted, decrypted: histShiftBMPDecrypted, message: histShiftMsgDecrypted }
    } catch (error) {
      return null
    }
  }

  function getSingularValueDecompositionImages(): EncryptedDecryptedImage | null {
    if (singValDecomp.isCapacityExceeded()) return null
    try {
      const singValDecompBMPEncrypted = singularValueDecompositionEncrypt(bmp, encrypted_text);
      const [singValDecompBMPDecrypted, singValDecompMsgDecrypted] = singularValueDecompositionDecrypt(singValDecompBMPEncrypted);
      return {encrypted: singValDecompBMPEncrypted, decrypted: singValDecompBMPDecrypted, message: singValDecompMsgDecrypted }
    } catch (error) {
      return null
    }
  }

  return new EncryptedFile(
    getDifferentialExpansionImages(),
    getHistogramShiftingImages(),
    getSingularValueDecompositionImages(),
  );
}

// -------------------------------------------------------------
// Actions

const messageTextArea: HTMLTextAreaElement = document.getElementById("crypto-image-message") as HTMLTextAreaElement;

messageTextArea.addEventListener('input', (event: Event) => {
  if (event) { encryptedText = (event.target as any).value; }
  if (typeof encryptedText != "string") return

  function updateCapacityCounters(counters: CapacityCounter[]) {
    counters.forEach(counter => counter.update(messageLength));
  }

  function handleDownloadButtonsAvailability(elements: Algorithm[]) {
    elements.forEach(element => element.checkWhetherCounterPassedZeroAndHandle());
  }

  const messageLength = encryptedText?.length ?? 0;
  maximumSize.label.innerHTML = (maximumSizeValue-messageLength).toString();
  updateCapacityCounters([diffExp.counter, histShift.counter, singValDecomp.counter]);

  handleDownloadButtonsAvailability([diffExp, histShift, singValDecomp]);
  tryEnableEncryptButton();
});

// -------------------------------------------------------------

const originalImageImg = document.getElementById("orignal-image-img") as HTMLImageElement;
const inputImg: HTMLInputElement = document.getElementById("form-input-image") as HTMLInputElement;

inputImg.addEventListener('input', async e => {
  function updateCounters(){
    function updateCapacityCounters(counters: CapacityCounter[]) {
      counters.forEach(counter => counter.countTo());
    }
  
    function updateInfoCounters(counters: InfoCounter[]) {
      counters.forEach(counter => counter.countTo());
    }

    function updateMaximumSizeValue() {
      maximumSizeValue = Math.max(
        diffExp.counter.currentBytesCapacity,
        histShift.counter.currentBytesCapacity,
        singValDecomp.counter.currentBytesCapacity
      ) - (encryptedText?.length ?? 0);
    }
  
    updateMaximumSizeValue()
    updateCapacityCounters([diffExp.counter, histShift.counter, singValDecomp.counter]);
    updateInfoCounters([imageSize, maximumSize, decodeSize]);
  }

  const inputImage: Blob = (e.target as any).files[0];
  inputImageInfo = await BMP.from(inputImage);

  originalImageImg.src = URL.createObjectURL( inputImage );
  updateCounters();
  tryEnableEncryptButton();
});

// -------------------------------------------------------------

const encryptBtn: HTMLButtonElement = document.getElementById("btn-encrypt") as HTMLButtonElement;

encryptBtn.addEventListener("click", function() {
  if (!inputImageInfo || !encryptedText) return

  function loadResultImagesToResultSection(encrypted: EncryptedFile){
    diffExp.loadResultsImagesToResultSection(encrypted.differentialExpansion);
    histShift.loadResultsImagesToResultSection(encrypted.histogramShifting);
    singValDecomp.loadResultsImagesToResultSection(encrypted.singularValueDecomposition);
  }

  function displayResultsSection(){
    const resultsSectionDiv = document.getElementById("section-results-div") as HTMLDivElement;
    resultsSectionDiv.style.display = "block";
    resultsSectionDiv.style.visibility = "visible";
  }

  function smoothScrollToResultsSection(){
    const imageProcessingCompletedHeading = document.getElementById("results-section-scroll-hook") as HTMLHeadingElement;
    imageProcessingCompletedHeading.scrollIntoView({ behavior: 'smooth' });
  }

  function downloadCheckboxSelectedImages(elements: Algorithm[]) {
    elements.forEach(element => element.download());
  }

  const encryptedFile: EncryptedFile = encryptAndDecrypt(inputImageInfo, encryptedText);
  try { encryptedFile.checkMessageValidity(); } catch (error) { console.log(error); }

  loadResultImagesToResultSection(encryptedFile);
  displayResultsSection();
  smoothScrollToResultsSection();
  downloadCheckboxSelectedImages([diffExp, histShift, singValDecomp]);
});

// -------------------------------------------------------------
// Navigation Functions

function smoothScrollToTopAfterReload(){
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------
// Display Related Functions

function makeHiddenOnClick(element: HTMLElement) {
  element.addEventListener('click', function() {
     element.style.opacity = '0';
     element.style.visibility = 'hidden';
  });
}

// -------------------------------------------------------------
// After Page Load Actions
smoothScrollToTopAfterReload();
makeHiddenOnClick(fullscreenDiv);
