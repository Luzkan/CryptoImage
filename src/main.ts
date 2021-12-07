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
let image_output: EncryptedFile | null = null;        // EncryptedFile Holder
let encrypted_text: string | null = null;             // Textfield Text Value
let bmp: BMP | null = null;                           // BMP Holder


// -------------------------------------------------------------
// HTML Elements

// Method Checkboxes
const checkbox1 = document.getElementById("method-1-checkbox") as HTMLInputElement;
const checkbox2 = document.getElementById("method-2-checkbox") as HTMLInputElement;
const checkbox3 = document.getElementById("method-3-checkbox") as HTMLInputElement;

// Images
const originalImageDiv = document.getElementById("original-image") as HTMLInputElement;

const diffExpEncodedDiv = document.getElementById("diff-exp-encoded-image") as HTMLInputElement;
const histShiftEncodedDiv = document.getElementById("hist-shift-encoded-image") as HTMLInputElement;
const singValDecompEncodedDiv = document.getElementById("sing-val-decomp-encoded-image") as HTMLInputElement;

const diffExpDecodedDiv = document.getElementById("diff-exp-decoded-image") as HTMLInputElement;
const histShiftDecodedDiv = document.getElementById("hist-shift-decoded-image") as HTMLInputElement;
const singValDecompDecodedDiv = document.getElementById("sing-val-decomp-decoded-image") as HTMLInputElement;

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


// -------------------------------------------------------------
// Logic

function encryptAndDecrypt(bmp: BMP, encrypted_text: string) {
  const diffExpBMPEncrypted = differentialExpansionEncrypt(bmp, encrypted_text);
  const [diffExpBMPDecrypted, diffExpMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);
  
  // TODO
  // const histShiftBMPEncrypted = histogramShiftingEncrypt(bmp, encrypted_text);
  // const [histShiftBMPDecrypted, histShiftMsgDecrypted] = differentialExpansionDecrypt(diffExpBMPEncrypted);

  const singValDecompBMPEncrypted = singularValueDecompositionEncrypt(bmp, encrypted_text);
  const [singValDecompBMPDecrypted, singValDecompMsgDecrypted] = singularValueDecompositionDecrypt(singValDecompBMPEncrypted);

  // TODO
  // if (!(diffExpMsgDecrypted === histShiftMsgDecrypted) || !(diffExpMsgDecrypted === singValDecompMsgDecrypted)) { console.log('Decryption Error!');}

  return new EncryptedFile(
    "output",
    diffExpMsgDecrypted,
    diffExpBMPEncrypted,
    null,
    singValDecompBMPEncrypted,
    diffExpBMPDecrypted,
    null,
    singValDecompBMPDecrypted
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

  // Loading Original Image into Website
  loadImage(originalImage, function (img: any) { originalImageDiv.appendChild(img); }, { maxWidth: 1100 });

  // Attempt to enable the encrypt button
  tryEnableEncryptButton();
  if (DEBUG) { console.log(bmp); console.log(`# Capacity Ascii Letters: ${bytesToWriteDE(bmp)}`); }
});

btnEncrypt.addEventListener("click", function() {
  if (!bmp || !encrypted_text) { return }

  image_output = encryptAndDecrypt(bmp, encrypted_text);

  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { diffExpEncodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPEncrypted.toBlob(), function (img: any) { histShiftEncodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.singValDecompBMPEncrypted.toBlob(), function (img: any) { singValDecompEncodedDiv.appendChild(img); }, { maxWidth: 300 });

  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { diffExpDecodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.diffExpBMPDecrypted.toBlob(), function (img: any) { histShiftDecodedDiv.appendChild(img); }, { maxWidth: 300 });
  loadImage(image_output.singValDecompBMPDecrypted.toBlob(), function (img: any) { singValDecompDecodedDiv.appendChild(img); }, { maxWidth: 300 });

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
