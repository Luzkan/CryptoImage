// -------------------------------------------------------------
// Classes

class EncryptedFile {
  constructor(
    public readonly differentialExpansion: EncryptedDecryptedImage | null,
    public readonly histogramShifting: EncryptedDecryptedImage | null,
    public readonly singularValueDecomposition: EncryptedDecryptedImage | null,
  ) { }

  getImages(): (EncryptedDecryptedImage | null)[] {
    return [
      this.differentialExpansion,
      this.histogramShifting,
      this.singularValueDecomposition
    ].filter(x => x !== null)
  }

  checkMessageValidity(): void {
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

class CounterCapacity {
  constructor(
    public label: HTMLSpanElement,
    public labelJQ: JQuery<HTMLElement>,
    public bytesToWrite: (bmp: BMP) => number,
    public currentBytesCapacity: number = 0,
  ) { }

  update(encrypted_message_length: number): void {
    this.label.innerHTML = (this.currentBytesCapacity - encrypted_message_length).toString()
  }

  countTo(): void {
    if (!inputImageInfo) return
    const getBytesToWriteCapacity = (inputImage: BMP): number => {
      try { return this.bytesToWrite(inputImage); } catch (e) { console.log(e); return 0 }
    }
    this.currentBytesCapacity = getBytesToWriteCapacity(inputImageInfo);  // @ts-ignore
    this.labelJQ.countTo({ from: parseInt(this.label.innerHTML), to: this.currentBytesCapacity - (encryptedText?.length ?? 0) });
  }
}

class CounterInformational {
  constructor(public label: HTMLSpanElement, public labelJQ: JQuery<HTMLElement>) { }
  
  countTo(topValue: number): void {
    if (!inputImageInfo) return // @ts-ignore
    this.labelJQ.countTo({ from: parseInt(this.label.innerHTML), to: topValue });
  }
}

class AlgorithmElements {
  constructor(
    public counter: CounterCapacity,
    public methodLabel: HTMLLabelElement,
    public checkbox: HTMLInputElement,
    public imageContainer: HTMLDivElement,
    public imageEncoded: HTMLImageElement,
    public imageDecoded: HTMLImageElement
  ) { }

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

    this.imageEncoded.src = URL.createObjectURL(image.encrypted.toBlob());
    this.imageDecoded.src = URL.createObjectURL(image.decrypted.toBlob());
    userFlowHandler.fullscreen.makeFullscreenOnClick(this.imageEncoded);
    userFlowHandler.fullscreen.makeFullscreenOnClick(this.imageDecoded);
  }

  download() {
    if (!this.checkbox.checked) return
    const link = document.createElement('a');
    link.download = this.methodLabel.children[0].innerHTML + ".bmp";
    link.href = this.imageEncoded.src;
    link.click();
  }
}

class Algorithms {
  constructor(
    public readonly differentialExpansion: AlgorithmElements,
    public readonly histogramShifting: AlgorithmElements,
    public readonly singularValueDecomposition: AlgorithmElements
  ) { }

  getCounters(): CounterCapacity[] {
    return [
      this.differentialExpansion.counter,
      this.histogramShifting.counter,
      this.singularValueDecomposition.counter,
    ]
  }

  getAlgorithmElements(): AlgorithmElements[] {
    return [
      this.differentialExpansion,
      this.histogramShifting,
      this.singularValueDecomposition,
    ]
  }

  downloadCheckboxSelectedImages(): void {
    this.getAlgorithmElements().forEach(algorithm => algorithm.download())
  }

  loadResultImagesToResultSection(encrypted: EncryptedFile): void {
    this.differentialExpansion.loadResultsImagesToResultSection(encrypted.differentialExpansion);
    this.histogramShifting.loadResultsImagesToResultSection(encrypted.histogramShifting);
    this.singularValueDecomposition.loadResultsImagesToResultSection(encrypted.singularValueDecomposition);
  }

  setupDivsBasedOnEncryptions(encrypted: EncryptedFile): void {
    const number_of_encrypted_files: 0 | 1 | 2 | 3 = encrypted.getImages().length as 0 | 1 | 2 | 3;
    const number_of_encrypted_files_to_col_sm_map = {
      0: "",
      1: "col-md-12",
      2: "col-md-6",
      3: "col-md-4"
    }
    const columns = ["col-md-12", "col-md-6", "col-md-4", "hidden-div"];

    function setupDiv(encryptedDecryptedImage: EncryptedDecryptedImage | null, algorithmElements: AlgorithmElements) {
      if (!encryptedDecryptedImage) {
        algorithmElements.imageContainer.classList.add("hidden-div");
        return;
      }

      columns.forEach(column => { algorithmElements.imageContainer.classList.remove(column) });
      algorithmElements.imageContainer.classList.add(number_of_encrypted_files_to_col_sm_map[number_of_encrypted_files]);
    }

    setupDiv(encrypted.differentialExpansion, this.differentialExpansion);
    setupDiv(encrypted.histogramShifting, this.histogramShifting);
    setupDiv(encrypted.singularValueDecomposition, this.singularValueDecomposition);
  }

}

class Fullscreen {
  constructor(public image: HTMLImageElement, public div: HTMLDivElement) { }

  replaceFullscreenImage(newImage: HTMLImageElement) {
    this.image.src = newImage.src;
  }

  makeFullscreenOnClick(newImage: HTMLImageElement) {
    const that: this = this;
    newImage.addEventListener('click', function () {
      that.replaceFullscreenImage(newImage);
      that.div.style.display = 'flex';
      that.div.style.visibility = 'visible';
      that.div.style.opacity = '1';
    })
  }

  makeFullscreenDivHiddenOnClick() {
    const that: this = this;
    this.div.addEventListener('click', function () {
      that.div.style.opacity = '0';
      that.div.style.visibility = 'hidden';
    });
  }

}

class UserFlowHandler {
  constructor(
    public originalImage: HTMLImageElement,
    public formInputImage: HTMLInputElement,
    public encryptButton: HTMLButtonElement,
    public messageTextArea: HTMLTextAreaElement,
    public encryptTooltip: HTMLParagraphElement,
    public fullscreen: Fullscreen
  ) { }

  smoothScrollToTopAfterReload() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  tryEnableEncryptButton() {
    const enableEncryptButton = () => {
      this.encryptButton.disabled = false;
      this.encryptTooltip.classList.add("permamently-transparent");
    }

    if (!inputImageInfo && !encryptedText) { this.encryptTooltip.innerHTML = "Upload an image first and type in text."; }
    else if (!inputImageInfo && encryptedText) { this.encryptTooltip.innerHTML = "Upload an image first."; }
    else if (inputImageInfo && !encryptedText) { this.encryptTooltip.innerHTML = "Type in encryption text first."; }
    else { enableEncryptButton() }
  }
}

// -------------------------------------------------------------
// Initializing

const userFlowHandler: UserFlowHandler = new UserFlowHandler(
  document.getElementById("img-preview-original-image") as HTMLImageElement,
  document.getElementById("input-form-image") as HTMLInputElement,
  document.getElementById("btn-encrypt") as HTMLButtonElement,
  document.getElementById("textarea-crypto-message") as HTMLTextAreaElement,
  document.getElementById("p-form-tooltip") as HTMLParagraphElement,
  new Fullscreen(
    document.getElementById("img-fullscreen") as HTMLImageElement,
    document.getElementById("div-fullscreen") as HTMLDivElement,
  )
);

// Globally scoped variables
let encryptedText: string | null = null;
let inputImageInfo: BMP | null = null;
let maximumSizeValue: number = 0;

const algorithms: Algorithms = new Algorithms(
  new AlgorithmElements(
    new CounterCapacity(
      document.getElementById("available-diff-exp-counter") as HTMLSpanElement,
      $('#available-diff-exp-counter'),
      bytesToWriteDE
    ),
    document.getElementById("method-de-label") as HTMLLabelElement,
    document.getElementById("method-de-checkbox") as HTMLInputElement,
    document.getElementById("method-de-div") as HTMLDivElement,
    document.getElementById("method-de-encoded-image") as HTMLImageElement,
    document.getElementById("method-de-decoded-image") as HTMLImageElement
  ),
  new AlgorithmElements(
    new CounterCapacity(
      document.getElementById("available-hist-shift-counter") as HTMLSpanElement,
      $('#available-hist-shift-counter'),
      bytesToWriteHS
    ),
    document.getElementById("method-hs-label") as HTMLLabelElement,
    document.getElementById("method-hs-checkbox") as HTMLInputElement,
    document.getElementById("method-hs-div") as HTMLDivElement,
    document.getElementById("method-hs-encoded-image") as HTMLImageElement,
    document.getElementById("method-hs-decoded-image") as HTMLImageElement
  ),
  new AlgorithmElements(
    new CounterCapacity(
      document.getElementById("available-sing-val-decomp-counter") as HTMLSpanElement,
      $('#available-sing-val-decomp-counter'),
      bytesToWriteDE  // TODO, change to bytesToWriteSVD
    ),
    document.getElementById("method-svd-label") as HTMLLabelElement,
    document.getElementById("method-svd-checkbox") as HTMLInputElement,
    document.getElementById("method-svd-div") as HTMLDivElement,
    document.getElementById("method-svd-encoded-image") as HTMLImageElement,
    document.getElementById("method-svd-decoded-image") as HTMLImageElement
  )
)

// Info Counters
const imageSize: CounterInformational = new CounterInformational(
  document.getElementById("image-size-counter") as HTMLSpanElement,
  $('#image-size-counter')
);

const maximumSize: CounterInformational = new CounterInformational(
  document.getElementById("maximum-size-counter") as HTMLSpanElement,
  $('#maximum-size-counter')
);

const decodeSize: CounterInformational = new CounterInformational(
  document.getElementById("decode-size-counter") as HTMLSpanElement,
  $('#decode-size-counter')
);



// -------------------------------------------------------------
// Logic

function encryptAndDecrypt(bmp: BMP, encrypted_text: string): EncryptedFile {

  function getDifferentialExpansionImages(): EncryptedDecryptedImage | null {
    if (algorithms.differentialExpansion.isCapacityExceeded()) return null
    try {
      const diffExpBMPEncrypted: BMP = differentialExpansionEncrypt(bmp, encrypted_text);
      const [diffExpBMPDecrypted, diffExpMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);
      return { encrypted: diffExpBMPEncrypted, decrypted: diffExpBMPDecrypted, message: diffExpMsgDecrypted }
    } catch (error) {
      return null
    }
  }

  function getHistogramShiftingImages(): EncryptedDecryptedImage | null {
    if (algorithms.histogramShifting.isCapacityExceeded()) return null
    try {
      const [histShiftBMPEncrypted, histShiftKeys] = histogramShiftingEncrypt(bmp, encrypted_text);
      const [histShiftBMPDecrypted, histShiftMsgDecrypted] = histogramShiftingDecrypt(histShiftBMPEncrypted, histShiftKeys);
      return { encrypted: histShiftBMPEncrypted, decrypted: histShiftBMPDecrypted, message: histShiftMsgDecrypted }
    } catch (error) {
      return null
    }
  }

  function getSingularValueDecompositionImages(): EncryptedDecryptedImage | null {
    if (algorithms.singularValueDecomposition.isCapacityExceeded()) return null
    try {
      const singValDecompBMPEncrypted = singularValueDecompositionEncrypt(bmp, encrypted_text);
      const [singValDecompBMPDecrypted, singValDecompMsgDecrypted] = singularValueDecompositionDecrypt(singValDecompBMPEncrypted);
      return { encrypted: singValDecompBMPEncrypted, decrypted: singValDecompBMPDecrypted, message: singValDecompMsgDecrypted }
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

userFlowHandler.messageTextArea.addEventListener('input', (event: Event) => {
  if (event) { encryptedText = (event.target as any).value; }
  if (typeof encryptedText != "string") return

  function updateCapacityCounters(counters: CounterCapacity[]) {
    counters.forEach(counter => counter.update(messageLength));
  }

  function handleDownloadButtonsAvailability(elements: AlgorithmElements[]) {
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

userFlowHandler.formInputImage.addEventListener('input', async e => {
  function updateCounters() {
    function updateCapacityCounters(counters: CounterCapacity[]) {
      counters.forEach(counter => counter.countTo());
    }

    function updateInfoCounters() {
      if (!inputImageInfo) return
      imageSize.countTo(inputImageInfo.fileSize / 1024);
      maximumSize.countTo(maximumSizeValue);
      decodeSize.countTo(inputImageInfo.fileSize / 1024);
    }

    function updateMaximumSizeValue() {
      const counterValues = algorithms.getCounters().map(counter => counter.currentBytesCapacity);
      maximumSizeValue = Math.max(...counterValues) - (encryptedText?.length ?? 0);
    }
    
    updateCapacityCounters(algorithms.getCounters());
    updateMaximumSizeValue();
    updateInfoCounters();
  }

  const inputImage: Blob = (e.target as any).files[0];
  inputImageInfo = await BMP.from(inputImage);

  userFlowHandler.originalImage.src = URL.createObjectURL(inputImage);
  updateCounters();
  userFlowHandler.tryEnableEncryptButton();
});

// -------------------------------------------------------------

userFlowHandler.encryptButton.addEventListener("click", function () {
  if (!inputImageInfo || !encryptedText) return

  function displayResultsSection() {
    const resultsSectionDiv = document.getElementById("section-results-div") as HTMLDivElement;
    resultsSectionDiv.style.display = "block";
    resultsSectionDiv.style.visibility = "visible";
  }

  function smoothScrollToResultsSection() {
    const imageProcessingCompletedHeading = document.getElementById("results-section-scroll-hook") as HTMLHeadingElement;
    imageProcessingCompletedHeading.scrollIntoView({ behavior: 'smooth' });
  }

  const encryptedFile: EncryptedFile = encryptAndDecrypt(inputImageInfo, encryptedText);
  try { encryptedFile.checkMessageValidity(); } catch (error) { console.log(error); }

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

