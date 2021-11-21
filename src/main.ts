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
let image_output: EncryptedFile | null = null;                      // EncryptedFile Holder
let encrypted_text: string | null = null;                           // Textfield Text Value
let bmp: BMP | null = null;                                         // BMP Holder
let created_images: Array<any> = new Array();

// -------------------------------------------------------------
// HTML Elements

// Method Checkboxes
const checkbox1 = document.getElementById("method-1-checkbox") as HTMLInputElement;
const checkbox2 = document.getElementById("method-2-checkbox") as HTMLInputElement;
const checkbox3 = document.getElementById("method-3-checkbox") as HTMLInputElement;

// Images
const originalImageDiv = document.getElementById("original-image") as HTMLDivElement;

const diffExpEncodedDiv = document.getElementById("diff-exp-encoded-image") as HTMLDivElement;
const histShiftEncodedDiv = document.getElementById("hist-shift-encoded-image") as HTMLDivElement;
const singValDecompEncodedDiv = document.getElementById("sing-val-decomp-encoded-image") as HTMLDivElement;

const diffExpDecodedDiv = document.getElementById("diff-exp-decoded-image") as HTMLDivElement;
const histShiftDecodedDiv = document.getElementById("hist-shift-decoded-image") as HTMLDivElement;
const singValDecompDecodedDiv = document.getElementById("sing-val-decomp-decoded-image") as HTMLDivElement;

// Label Counters
const imageSizeCounterLabel = document.getElementById("image-size-counter") as HTMLSpanElement;
const availableSizeCounterLabel = document.getElementById("availalbe-size-counter") as HTMLSpanElement;
const decodeSizeCounterLabel = document.getElementById("decode-size-counter") as HTMLSpanElement;

// Encryption Form (ImageInput, Textfield, Button and Tooltip)
const inputImage = document.getElementById("form-input-image") as HTMLInputElement;
const textareaMessage = document.getElementById("crypto-image-message") as HTMLTextAreaElement;
const btnEncrypt = document.getElementById("btn-encrypt") as HTMLButtonElement;
const pEncryptTooltip = document.getElementById("btn-encrypt-tooltip") as HTMLParagraphElement;


// -------------------------------------------------------------
// Misc Functions

function tryEnableEncryptButton() {
  if (!bmp || !encrypted_text) { pEncryptTooltip.innerHTML = "Upload an image first."; }
  else if (!bmp) { pEncryptTooltip.innerHTML = "Upload an image first."; }
  else if (!encrypted_text) { pEncryptTooltip.innerHTML = "Type in encryption text first."; }
  else { enableEncryptButton() }
}

function enableEncryptButton() {
  // Enables the encrypt button if the textfield is not empty
  if (btnEncrypt && pEncryptTooltip) {
    btnEncrypt.disabled = false;
    pEncryptTooltip.classList.add("permamently-transparent");
  }
}

function markImage(image: any) {
  created_images.push(image);
  image.classList.add("encoded-image-display");
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
  if (DEBUG) { console.log(encrypted_text); }
  tryEnableEncryptButton();
});


inputImage.addEventListener('input', async e => {
  // Retrieve Imagefile
  const originalImage = (e.target as any).files[0];

  // Decode & Create Pixel 3D Array
  bmp = await BMP.from(originalImage);

  // Deleting Images that could've been added on previous execution of input
  deletePreviouslyAddedDisplayImage()

  // Loading Original Image into Website
  loadImage(originalImage, function (img: any) { img.classList.add("display-original-img"); originalImageDiv.appendChild(img); },
   {
      // maxWidth: 600, contain: true, cover: true
  });

  // Attempt to enable the encrypt button
  tryEnableEncryptButton();
  if (DEBUG) { console.log(bmp); console.log(`# Capacity Ascii Letters: ${bytesToWriteDE(bmp)}`); }
});

btnEncrypt.addEventListener("click", function() {
  if (!bmp || !encrypted_text) { return }

  image_output = encryptAndDecrypt(bmp, encrypted_text);

  deletePreviouslyAddedEncryptedImages()

  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { markImage(img); diffExpEncodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { markImage(img); histShiftEncodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { markImage(img); singValDecompEncodedDiv.appendChild(img); }, { maxWidth: 300 });

  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { markImage(img); diffExpDecodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { markImage(img); histShiftDecodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { markImage(img); singValDecompDecodedDiv.appendChild(img); }, { maxWidth: 300 });

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
