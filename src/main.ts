// -------------------------------------------------------------
// Initialization

const DEBUG = true

// -------------------------------------------------------------
// Data Storages

// Class storing the variables for the image
class EncryptedFile {
  constructor(
    public readonly name: string,
    public readonly message: string,
    public readonly diffExpBMPEncrypted: BMP,
    public readonly histShiftBMPEncrypted: BMP | null,
    public readonly singValDecompBMPEncrypted: BMP,
    public readonly diffExpBMPDecrypted: BMP,
    public readonly histShiftBMPDecrypted: BMP | null,
    public readonly singValDecompBMPDecrypted: BMP
  ) { }
}

// Globally scoped variables
let image_output: EncryptedFile | null = null;
let encrypted_text: string | null = null;
let bmp: BMP | null = null;
let current_bytes_to_write_de: number = 0;
let current_bytes_to_write_hs: number = 0;
let current_bytes_to_write_svd: number = 0;
let maximumSize: number = 0;

// -------------------------------------------------------------
// HTML Elements

// Method Checkboxes
const checkbox1 = document.getElementById("method-1-checkbox") as HTMLInputElement;
const checkbox2 = document.getElementById("method-2-checkbox") as HTMLInputElement;
const checkbox3 = document.getElementById("method-3-checkbox") as HTMLInputElement;

// Method Labels
const labelDE = document.getElementById("method-de-label") as HTMLLabelElement;
const labelHS = document.getElementById("method-hs-label") as HTMLLabelElement;
const labelSVD = document.getElementById("method-svd-label") as HTMLLabelElement;

// Image Original
const originalImageDiv = document.getElementById("original-image-div") as HTMLDivElement;
const originalImageImg = document.getElementById("orignal-image-img") as HTMLImageElement;

// Fullscreen
const fullscreenDiv = document.getElementById("fullscreen-div") as HTMLDivElement;
const fullscreenImg = document.getElementById("fullscreen-img") as HTMLImageElement;

// Immges Encoded
const diffExpEncodedImg = document.getElementById("diff-exp-encoded-image") as HTMLImageElement;
const histShiftEncodedImg = document.getElementById("hist-shift-encoded-image") as HTMLImageElement;
const singValDecompEncodedImg = document.getElementById("sing-val-decomp-encoded-image") as HTMLImageElement;

// Immges Decoded
const diffExpDecodedImg = document.getElementById("diff-exp-decoded-image") as HTMLImageElement;
const histShiftDecodedImg = document.getElementById("hist-shift-decoded-image") as HTMLImageElement;
const singValDecompDecodedImg = document.getElementById("sing-val-decomp-decoded-image") as HTMLImageElement;

// Available Size Counters
const availableSizeDiffExpCounterLabel = document.getElementById("available-diff-exp-counter") as HTMLSpanElement;
const availableSizeHistShiftCounterLabel = document.getElementById("available-hist-shift-counter") as HTMLSpanElement;
const availableSizeSingValDecompCounterLabel = document.getElementById("available-sing-val-decomp-counter") as HTMLSpanElement;
                                                                                 // @ts-ignore
const availableSizeDiffExpCounterLabelJQ = $('#available-diff-exp-counter')      // @ts-ignore
const availableSizeHistShiftCounterLabelJQ = $('#available-hist-shift-counter')  // @ts-ignore
const availableSizeSingValDecompCounterLabelJQ = $('#available-sing-val-decomp-counter')

// Info Counters
const imageSizeCounterLabel = document.getElementById("image-size-counter") as HTMLSpanElement;
const maximumSizeCounterLabel = document.getElementById("maximum-size-counter") as HTMLSpanElement;
const decodeSizeCounterLabel = document.getElementById("decode-size-counter") as HTMLSpanElement;
                                                                                 // @ts-ignore
const imageSizeCounterLabelJQ = $('#image-size-counter')                         // @ts-ignore
const maximumSizeCounterLabelJQ = $('#maximum-size-counter')                     // @ts-ignore
const decodeSizeCounterLabelJQ = $('#decode-size-counter')

// Encryption Form (ImageInput, Textfield, Button and Tooltip)
const inputImg = document.getElementById("form-input-image") as HTMLInputElement;
const messageTextarea = document.getElementById("crypto-image-message") as HTMLTextAreaElement;
const encryptBtn = document.getElementById("btn-encrypt") as HTMLButtonElement;
const encryptTooltip = document.getElementById("p-encrypt-tooltip") as HTMLParagraphElement;

// -------------------------------------------------------------
// Navigation Functions

function smoothScrollToTopAfterReload(){
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}

function smoothScrollToResultsSection(){
  const imageProcessingCompletedHeading = document.getElementById("results-section-scroll-hook") as HTMLHeadingElement;
  imageProcessingCompletedHeading.scrollIntoView({ behavior: 'smooth' });
}

// -------------------------------------------------------------
// Display Related Functions

function makeFullscreenOnClick(image: HTMLImageElement) {
  image.addEventListener('click', function() {
    fullscreenImg.src = image.src;
    fullscreenDiv.style.display = 'flex';
    fullscreenDiv.style.visibility = 'visible';
    fullscreenDiv.style.opacity = '1';
  });
}

function makeHiddenOnClick(element: HTMLElement) {
  element.addEventListener('click', function() {
     element.style.opacity = '0';
     element.style.visibility = 'hidden';
  });
}

function displayResultsSection(){
  const resultsSectionDiv = document.getElementById("section-results-div") as HTMLDivElement;
  resultsSectionDiv.style.display = "block";
  resultsSectionDiv.style.visibility = "visible";
}

// -------------------------------------------------------------
// User Controls Related Functions

function tryEnableEncryptButton() {
  if (!bmp && !encrypted_text) { encryptTooltip.innerHTML = "Upload an image first and type in text."; }
  else if (!bmp && encrypted_text) { encryptTooltip.innerHTML = "Upload an image first."; }
  else if (bmp && !encrypted_text) { encryptTooltip.innerHTML = "Type in encryption text first."; }
  else { enableEncryptButton() }
}

function enableEncryptButton() {
  // Enables the encrypt button if the textfield is not empty
  if (encryptBtn && encryptTooltip) {
    encryptBtn.disabled = false;
    encryptTooltip.classList.add("permamently-transparent");
  }
}

function handleDownloadButtonsAvailability() {
  function checkWhetherCounterPassedZeroAndHandle(currentCount: number, label: HTMLLabelElement) {
    if (currentCount - (encrypted_text?.length ?? 0) < 0) {
      label.classList.add("disabled-download-option");
      label.children[2].innerHTML = "- no capacity";
    } else {
      label.classList.remove("disabled-download-option");
      label.children[2].innerHTML = "";
    }
  }

  checkWhetherCounterPassedZeroAndHandle(current_bytes_to_write_de, labelDE)
  checkWhetherCounterPassedZeroAndHandle(current_bytes_to_write_hs, labelHS)
  checkWhetherCounterPassedZeroAndHandle(current_bytes_to_write_svd, labelSVD)
}

function updateCounters(bmp: BMP){
  function updateCapacityCounters() {
    current_bytes_to_write_de = bytesToWriteDE(bmp)
    current_bytes_to_write_hs = bytesToWriteHS(bmp)
    current_bytes_to_write_svd = bytesToWriteDE(bmp) // TODO: ... = bytesToWriteSVD(bmp)
    const target_bytes_number_de: number = current_bytes_to_write_de - (encrypted_text?.length ?? 0);
    const target_bytes_number_hs: number = current_bytes_to_write_hs - (encrypted_text?.length ?? 0);
    const target_bytes_number_svd: number = current_bytes_to_write_svd - (encrypted_text?.length ?? 0);
  
    availableSizeDiffExpCounterLabelJQ.countTo({from: parseInt(availableSizeDiffExpCounterLabel.innerHTML), to: target_bytes_number_de});
    availableSizeHistShiftCounterLabelJQ.countTo({from: parseInt(availableSizeHistShiftCounterLabel.innerHTML), to: target_bytes_number_hs});
    availableSizeSingValDecompCounterLabelJQ.countTo({from: parseInt(availableSizeSingValDecompCounterLabel.innerHTML), to: target_bytes_number_svd});
  }

  function updateInfoCounters() {
    maximumSize = Math.max(current_bytes_to_write_de, current_bytes_to_write_hs, current_bytes_to_write_svd) - (encrypted_text?.length ?? 0);

    imageSizeCounterLabelJQ.countTo({from: parseInt(imageSizeCounterLabel.innerHTML), to: Math.floor(bmp.fileSize/1024)});
    maximumSizeCounterLabelJQ.countTo({from: parseInt(maximumSizeCounterLabel.innerHTML), to: maximumSize});
    decodeSizeCounterLabelJQ.countTo({from: parseInt(decodeSizeCounterLabel.innerHTML), to: Math.floor(bmp.fileSize/1024)});
  }

  updateCapacityCounters();
  updateInfoCounters();

}


// -------------------------------------------------------------
// Misc Functions

function loadResultImagesToResultSection(image_output: EncryptedFile){
  if (image_output.diffExpBMPEncrypted) {
    diffExpEncodedImg.src = URL.createObjectURL( image_output.diffExpBMPEncrypted.toBlob() );
    makeFullscreenOnClick(diffExpEncodedImg);
    diffExpDecodedImg.src = URL.createObjectURL( image_output.diffExpBMPDecrypted.toBlob() );
    makeFullscreenOnClick(diffExpDecodedImg);
  }
  if (image_output.histShiftBMPEncrypted) {
    histShiftEncodedImg.src = URL.createObjectURL( image_output.histShiftBMPEncrypted.toBlob() );
    makeFullscreenOnClick(histShiftEncodedImg);
    histShiftDecodedImg.src = URL.createObjectURL( image_output.histShiftBMPDecrypted!.toBlob() );
    makeFullscreenOnClick(histShiftDecodedImg);
  }
  if (image_output.singValDecompBMPEncrypted) {
    singValDecompEncodedImg.src = URL.createObjectURL( image_output.singValDecompBMPEncrypted.toBlob() );
    makeFullscreenOnClick(singValDecompEncodedImg);
    singValDecompDecodedImg.src = URL.createObjectURL( image_output.singValDecompBMPDecrypted.toBlob() );
    makeFullscreenOnClick(singValDecompDecodedImg);
  }
}

function deletePreviouslyAddedDisplayImage() {
  var displayImage: HTMLCollectionOf<Element> = document.getElementsByClassName("display-original-img")
  Array.from(displayImage).forEach(function(element) { element.remove(); });
}

// -------------------------------------------------------------
// Logic



function encryptAndDecrypt(bmp: BMP, encrypted_text: string): EncryptedFile {

  function histogram_shifting(): [BMP | null, BMP | null, string | null]{
    try {
      const [histShiftBMPEncrypted, histShiftKeys] = histogramShiftingEncrypt(bmp, encrypted_text);
      const [histShiftBMPDecrypted, histShiftMsgDecrypted] = histogramShiftingDecrypt(histShiftBMPEncrypted, histShiftKeys);
      return [histShiftBMPEncrypted, histShiftBMPDecrypted, histShiftMsgDecrypted]
    } catch (error) {
      return [null, null, null]
    }
  }

  const diffExpBMPEncrypted = differentialExpansionEncrypt(bmp, encrypted_text);
  const [diffExpBMPDecrypted, diffExpMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);

  const [histShiftBMPEncrypted, histShiftBMPDecrypted, histShiftMsgDecrypted] = histogram_shifting();

  const singValDecompBMPEncrypted = singularValueDecompositionEncrypt(bmp, encrypted_text);
  const [singValDecompBMPDecrypted, singValDecompMsgDecrypted] = singularValueDecompositionDecrypt(singValDecompBMPEncrypted);

  if (!(diffExpMsgDecrypted === histShiftMsgDecrypted) || !(diffExpMsgDecrypted === singValDecompMsgDecrypted)) {
    console.log('Message Decryption Error!');
    console.log(`Differential Expansion: ${diffExpMsgDecrypted}`);
    console.log(`Histogram Shifting: ${histShiftMsgDecrypted}`);
    console.log(`Singular Value Decomposition: ${singValDecompMsgDecrypted}`);
  }

  return new EncryptedFile(
    "output",
    diffExpMsgDecrypted,
    diffExpBMPEncrypted,
    histShiftBMPEncrypted,
    singValDecompBMPEncrypted,
    diffExpBMPDecrypted,
    histShiftBMPDecrypted,
    singValDecompBMPDecrypted
  );
}

// -------------------------------------------------------------
// Actions

messageTextarea.addEventListener('input', (event: Event) => {
  if (event) { encrypted_text = (event.target as any).value; }
  if (encrypted_text) { availableSizeDiffExpCounterLabel.innerHTML = (current_bytes_to_write_de-encrypted_text?.length).toString(); }
  if (encrypted_text) { availableSizeHistShiftCounterLabel.innerHTML = (current_bytes_to_write_hs-encrypted_text?.length).toString(); }
  if (encrypted_text) { availableSizeSingValDecompCounterLabel.innerHTML = (current_bytes_to_write_svd-encrypted_text?.length).toString(); }
  if (encrypted_text) { maximumSizeCounterLabel.innerHTML = (maximumSize-encrypted_text?.length).toString(); }
  handleDownloadButtonsAvailability();
  tryEnableEncryptButton();
});


inputImg.addEventListener('input', async e => {
  // Retrieve Imagefile
  const originalImage = (e.target as any).files[0];

  // Decode & Create Pixel 3D Array
  bmp = await BMP.from(originalImage);

  originalImageImg.src = URL.createObjectURL( originalImage );
  updateCounters(bmp);
  tryEnableEncryptButton();
});

encryptBtn.addEventListener("click", function() {
  if (!bmp || !encrypted_text) { return }

  image_output = encryptAndDecrypt(bmp, encrypted_text);

  loadResultImagesToResultSection(image_output);
  displayResultsSection();
  smoothScrollToResultsSection();
});

encryptBtn.addEventListener('click', function () {
  if (checkbox1 && image_output && checkbox1.checked) { downloadBMP(image_output.diffExpBMPEncrypted, `diff_exp_encoded_${ image_output.name }`); }
  // TODO if (checkbox2 && image_output && checkbox2.checked) { downloadBMP(image_output.histShiftBMPEncrypted, `hist_shift_encoded_${ image_output.name }`); }
  if (checkbox3 && image_output && checkbox3.checked) { downloadBMP(image_output.singValDecompBMPEncrypted, `sing_val_decomp_encoded_${ image_output.name }`); }

  if (checkbox1 && image_output && checkbox1.checked) { downloadBMP(image_output.diffExpBMPDecrypted, `diff_exp_decoded_${ image_output.name }`); }
  // TODO if (checkbox2 && image_output && checkbox2.checked) { downloadBMP(image_output.histShiftBMPDecrypted, `hist_shift_decoded_${ image_output.name }`); }
  if (checkbox3 && image_output && checkbox3.checked) { downloadBMP(image_output.singValDecompBMPDecrypted, `sing_val_decomp_decoded_${ image_output.name }`); }

  if (image_output) { console.log(`Encoded / Decoded:\n${image_output.message}`); }
});

// After Page Load
smoothScrollToTopAfterReload();
makeHiddenOnClick(fullscreenDiv);
