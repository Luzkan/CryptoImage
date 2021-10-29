// -------------------------------------------------------------
// Initialization

// Developer Logging
const DEBUG = true


// -------------------------------------------------------------
// Data Storages


// Class storing the variables for the image
class EncryptedFile {
    name: any;
    encryptedImage1: null;
    encryptedImage2: null;
    encryptedImage3: null;
    
    constructor(name: any, encryptedImage1 = null, encryptedImage2 = null, encryptedImage3 = null) {
      this.name = name;
      this.encryptedImage1 = encryptedImage1;
      this.encryptedImage2 = encryptedImage2;
      this.encryptedImage3 = encryptedImage3;
    }
}


// Method Checkboxes
const checkbox1 = document.getElementById("method-1-checkbox") as HTMLInputElement;
const checkbox2 = document.getElementById("method-2-checkbox") as HTMLInputElement;
const checkbox3 = document.getElementById("method-3-checkbox") as HTMLInputElement;


// Label Counters
const imageSizeCounterLabel = document.getElementById("image-size-counter");
const availableSizeCounterLabel = document.getElementById("availalbe-size-counter");
const decodeSizeCounterLabel = document.getElementById("decode-size-counter");


// Globally scoped variables
let image_output: EncryptedFile | null = null;        // EncryptedFile holder
let encrypted_text: string | null = null;             // Textfield Text Value


// -------------------------------------------------------------
// Misc Functions


function enableEncryptButton() {

    // Enable the encrypt button if the textfield is not empty
    const encryptButton = document.getElementById("btn-encrypt") as HTMLButtonElement;
    const encryptButtonTooltip = document.getElementById("btn-encrypt-tooltip");

    // if encryptButton is not null, enable it
    if (encryptButton && encryptButtonTooltip) {
        encryptButton.disabled = false;
        encryptButtonTooltip.classList.add("permamently-transparent");
    }
}


// -------------------------------------------------------------
// Actions

// This updates the global text variable on any input change
const cryptoImageMessage = document.getElementById("crypto-image-message") as HTMLTextAreaElement;
cryptoImageMessage.addEventListener('input', (event: Event) => {
    if (event) {encrypted_text = event.target.value;};
    if (DEBUG) {console.log(encrypted_text);}
});


// After any image file is provided, immiedietly convert
const formInputImage = document.getElementById("form-input-image") as HTMLInputElement;
formInputImage.addEventListener('input', async e => {

    // Retrieve Imagefile
    const file = e.target.files[0];

    // Decode & Create Pixel 3D Array
    const decodedFile = await decodeBMP(file);
    const pixel3DArray = decodedFile.pixels3D;
    if (DEBUG) {console.log(decodedFile);}

    // Refer: algorithms.js
    const encodedImage1 = await differentialExpansionEncrypt(pixel3DArray);
    const encodedImage2 = await histogramShiftingEncrypt(pixel3DArray);
    const encodedImage3 = await singularValueDecompositionEncrypt(pixel3DArray);

    // Output is in global scope
    image_output = new EncryptedFile(file.name, encodedImage1, encodedImage2, encodedImage3);

    // Enable Convert Button
    enableEncryptButton()
});


// This function handles the Encode/Decode actions
const btnEncrypt = document.getElementById("btn-encrypt") as HTMLButtonElement;
btnEncrypt.addEventListener('click', function(){

    // Downlaod based on checkbox values
    if (checkbox1 && image_output && checkbox1.checked) { downloadBlob(image_output.encryptedImage1, `encrypted1-${image_output.name}`); }
    if (checkbox2 && image_output && checkbox2.checked) { downloadBlob(image_output.encryptedImage2, `encrypted2-${image_output.name}`); }
    if (checkbox3 && image_output && checkbox3.checked) { downloadBlob(image_output.encryptedImage3, `encrypted3-${image_output.name}`); }
});
