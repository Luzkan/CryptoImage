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
    public readonly singValDecompBMPEncrypted: BMP | null,
    public readonly diffExpBMPDecrypted: BMP,
    public readonly histShiftBMPDecrypted: BMP | null,
    public readonly singValDecompBMPDecrypted: BMP | null
  ) { }
}

// Globally scoped variables
let image_output: EncryptedFile | null = null;
let encrypted_text: string | null = null;
let bmp: BMP | null = null;
let created_images: Array<any> = new Array();
let current_bytes_to_write_de: number = 0;

// -------------------------------------------------------------
// HTML Elements

// Method Checkboxes
const checkbox1 = document.getElementById("method-1-checkbox") as HTMLInputElement;
const checkbox2 = document.getElementById("method-2-checkbox") as HTMLInputElement;
const checkbox3 = document.getElementById("method-3-checkbox") as HTMLInputElement;

const fullPage: HTMLDivElement = document.getElementById('fullpage-image') as HTMLDivElement;

// Image Original
const originalImageDiv = document.getElementById("original-image") as HTMLDivElement;

// Immges Encoded
const diffExpEncodedDiv = document.getElementById("diff-exp-encoded-image") as HTMLDivElement;
const diffExpEncodedFullscreenDiv = document.getElementById("diff-exp-encoded-image-fullscreen") as HTMLDivElement;
const histShiftEncodedDiv = document.getElementById("hist-shift-encoded-image") as HTMLDivElement;
const histShiftEncodedFullscreenDiv = document.getElementById("hist-shift-encoded-image-fullscreen") as HTMLDivElement;
const singValDecompEncodedDiv = document.getElementById("sing-val-decomp-encoded-image") as HTMLDivElement;
const singValDecompEncodedFullscreenDiv = document.getElementById("sing-val-decomp-encoded-image-fullscreen") as HTMLDivElement;

// Immges Decoded
const diffExpDecodedDiv = document.getElementById("diff-exp-decoded-image") as HTMLDivElement;
const diffExpDecodedFullscreenDiv = document.getElementById("diff-exp-decoded-image-fullscreen") as HTMLDivElement;
const histShiftDecodedDiv = document.getElementById("hist-shift-decoded-image") as HTMLDivElement;
const histShiftDecodedFullscreenDiv = document.getElementById("hist-shift-decoded-image-fullscreen") as HTMLDivElement;
const singValDecompDecodedDiv = document.getElementById("sing-val-decomp-decoded-image") as HTMLDivElement;
const singValDecompDecodedFullscreenDiv = document.getElementById("sing-val-decomp-decoded-image-fullscreen") as HTMLDivElement;

// Label Counters
const imageSizeCounterLabel = document.getElementById("image-size-counter") as HTMLSpanElement;
const availableSizeCounterLabel = document.getElementById("availalbe-size-counter") as HTMLSpanElement;
const decodeSizeCounterLabel = document.getElementById("decode-size-counter") as HTMLSpanElement;
// @ts-ignore
const imageSizeCounterLabelJQ = $('#image-size-counter')
// @ts-ignore
const availableSizeCounterLabelJQ = $('#availalbe-size-counter')
// @ts-ignore
const decodeSizeCounterLabelJQ = $('#decode-size-counter')

// Encryption Form (ImageInput, Textfield, Button and Tooltip)
const inputImage = document.getElementById("form-input-image") as HTMLInputElement;
const textareaMessage = document.getElementById("crypto-image-message") as HTMLTextAreaElement;
const btnEncrypt = document.getElementById("btn-encrypt") as HTMLButtonElement;
const pEncryptTooltip = document.getElementById("p-encrypt-tooltip") as HTMLParagraphElement;


// -------------------------------------------------------------
// Misc Functions

function tryEnableEncryptButton() {
  if (!bmp && !encrypted_text) { pEncryptTooltip.innerHTML = "Upload an image first and type in text."; }
  else if (!bmp && encrypted_text) { pEncryptTooltip.innerHTML = "Upload an image first."; }
  else if (bmp && !encrypted_text) { pEncryptTooltip.innerHTML = "Type in encryption text first."; }
  else { enableEncryptButton() }
}

function enableEncryptButton() {
  // Enables the encrypt button if the textfield is not empty
  if (btnEncrypt && pEncryptTooltip) {
    btnEncrypt.disabled = false;
    pEncryptTooltip.classList.add("permamently-transparent");
  }
}

function markResultImage(image: any, fullscreenContainer: any) {
  image.classList.add("encoded-image-display");
  image.addEventListener('click', function() {
    fullscreenContainer.style.display = 'flex';
    fullscreenContainer.style.visibility = 'visible';
    fullscreenContainer.style.opacity = '1';
  });
  created_images.push(image);
}

function makeHiddenOnClick(element: any) {
  element.addEventListener('click', function() { element.style.display = 'none'; });
}

function markResultFullScreenImage(image: any) {
  created_images.push(image);
}

function deletePreviouslyAddedDisplayImage() {
  var displayImage: HTMLCollectionOf<Element> = document.getElementsByClassName("display-original-img")
  for (let i = 0; i < displayImage.length; i++) { displayImage[i].remove(); }
  // TODO: addedImages.forEach(element: => element.remove())
}

function deletePreviouslyAddedEncryptedImages() {
  created_images.forEach(element => element.remove())
  created_images = new Array()
}

function smoothScrollToTopAfterReload(){
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
}

function smoothScrollToResultsSection(){
  const imageProcessingCompletedHeading = document.getElementById("results-section-scroll-hook") as HTMLHeadingElement;
  imageProcessingCompletedHeading.scrollIntoView({ behavior: 'smooth' });
}

function displayResultsSection(){
  const resultsSectionDiv = document.getElementById("section-results-div") as HTMLDivElement;
  resultsSectionDiv.style.display = "block";
  resultsSectionDiv.style.visibility = "visible";
}

function loadResultImagesToResultSection(image_output: any){
  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { markResultImage(img, diffExpEncodedFullscreenDiv); diffExpEncodedDiv.appendChild(img);}, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { markResultImage(img, histShiftEncodedFullscreenDiv); histShiftEncodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { markResultImage(img, singValDecompEncodedFullscreenDiv); singValDecompEncodedDiv.appendChild(img); }, { maxWidth: 300 });

  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { markResultImage(img, diffExpDecodedFullscreenDiv); diffExpDecodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { markResultImage(img, histShiftDecodedFullscreenDiv); histShiftDecodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { markResultImage(img, singValDecompDecodedFullscreenDiv); singValDecompDecodedDiv.appendChild(img); }, { maxWidth: 300 });
}

function loadResultImagesToFullscreenContainers(image_output: any){
  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { markResultFullScreenImage(img); diffExpEncodedFullscreenDiv.appendChild(img);}, {});
  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { markResultFullScreenImage(img); histShiftEncodedFullscreenDiv.appendChild(img); }, {  });
  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { markResultFullScreenImage(img); singValDecompEncodedFullscreenDiv.appendChild(img); }, {  });

  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { markResultFullScreenImage(img); diffExpDecodedFullscreenDiv.appendChild(img); }, {  });
  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { markResultFullScreenImage(img); histShiftDecodedFullscreenDiv.appendChild(img); }, {  });
  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { markResultFullScreenImage(img); singValDecompDecodedFullscreenDiv.appendChild(img); }, {  });
}

function updateCounters(bmp: BMP){
  current_bytes_to_write_de = bytesToWriteDE(bmp)
  let target_bytes_number = current_bytes_to_write_de
  if (encrypted_text) {
    target_bytes_number = current_bytes_to_write_de-encrypted_text?.length;
  }

  imageSizeCounterLabelJQ.countTo({from: parseInt(imageSizeCounterLabel.innerHTML), to: Math.floor(bmp.fileSize/1024)});
  availableSizeCounterLabelJQ.countTo({from: parseInt(availableSizeCounterLabel.innerHTML), to: target_bytes_number});
  decodeSizeCounterLabelJQ.countTo({from: parseInt(decodeSizeCounterLabel.innerHTML), to: target_bytes_number});
}

// -------------------------------------------------------------
// Logic

function encryptAndDecrypt(bmp: BMP, encrypted_text: string) {
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

  return new EncryptedFile(
    "output",
    diffExpMsgDecrypted,
    diffExpBMPEncrypted,
    null,
    null,
    diffExpBMPDecrypted,
    null,
    null
  );
}

// -------------------------------------------------------------
// Actions

textareaMessage.addEventListener('input', (event: Event) => {
  if (event) { encrypted_text = (event.target as any).value; }
  if (encrypted_text) { availableSizeCounterLabel.innerHTML = (current_bytes_to_write_de-encrypted_text?.length).toString(); }
  tryEnableEncryptButton();
});


inputImage.addEventListener('input', async e => {
  // Retrieve Imagefile
  const originalImage = (e.target as any).files[0];

  // Decode & Create Pixel 3D Array
  bmp = await BMP.from(originalImage);

  deletePreviouslyAddedDisplayImage()
  loadImage(originalImage, function (img: any) { img.classList.add("display-original-img"); originalImageDiv.appendChild(img); }, { });
  updateCounters(bmp);
  tryEnableEncryptButton();
});

btnEncrypt.addEventListener("click", function() {
  if (!bmp || !encrypted_text) { return }

  image_output = encryptAndDecrypt(bmp, encrypted_text);

  deletePreviouslyAddedEncryptedImages();
  loadResultImagesToResultSection(image_output);
  loadResultImagesToFullscreenContainers(image_output);
  displayResultsSection();
  smoothScrollToResultsSection();
});

btnEncrypt.addEventListener('click', function () {
  if (checkbox1 && image_output && checkbox1.checked) { downloadBMP(image_output.diffExpBMPEncrypted, `diff_exp_${ image_output.name }`); }
  // TODO
  // if (checkbox2 && image_output && checkbox2.checked) { downloadBMP(image_output.histShiftBMPEncrypted, `hist_shift_${ image_output.name }`); }
  // if (checkbox3 && image_output && checkbox3.checked) { downloadBMP(image_output.singValDecompBMPEncrypted, `sing_val_decomp_${ image_output.name }`); }

  if (DEBUG && checkbox3 && image_output && checkbox3.checked) { downloadBMP(image_output.diffExpBMPDecrypted, "`diff_exp_decoded.bmp"); }
  // TODO
  // if (DEBUG && checkbox3 && image_output && checkbox3.checked) { downloadBMP(image_output.histShiftBMPDecrypted, "hist_shift_decoded.bmp"); }
  // if (DEBUG && checkbox3 && image_output && checkbox3.checked) { downloadBMP(image_output.singValDecompBMPDecrypted, "sing_val_decomp_decoded.bmp"); }

  if (DEBUG && image_output) { console.log("Decoded:"); console.log(image_output.message); }
});

// After Page Load
smoothScrollToTopAfterReload();
makeHiddenOnClick(diffExpEncodedFullscreenDiv);
makeHiddenOnClick(histShiftEncodedFullscreenDiv);
makeHiddenOnClick(singValDecompEncodedFullscreenDiv);
makeHiddenOnClick(diffExpDecodedFullscreenDiv);
makeHiddenOnClick(histShiftDecodedFullscreenDiv);
makeHiddenOnClick(singValDecompDecodedFullscreenDiv);
