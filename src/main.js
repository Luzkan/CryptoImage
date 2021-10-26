// -------------------------------------------------------------
// Initialization

// Developer Logging
const DEBUG = true


// -------------------------------------------------------------
// Data Storages


// Class storing the variables for the image
class EncryptedFile {
    constructor(name, encryptedImage1 = null, encryptedImage2 = null, encryptedImage3 = null) {
      this.name = name;
      this.encryptedImage1 = encryptedImage1;
      this.encryptedImage2 = encryptedImage2;
      this.encryptedImage3 = encryptedImage3;
    }
}


// Method Checkboxes
const checkbox1 = document.getElementById("method-1-checkbox");
const checkbox2 = document.getElementById("method-2-checkbox");
const checkbox3 = document.getElementById("method-3-checkbox");


// Label Counters
const imageSizeCounterLabel = document.getElementById("image-size-counter");
const availableSizeCounterLabel = document.getElementById("availalbe-size-counter");
const decodeSizeCounterLabel = document.getElementById("decode-size-counter");


// Globally scoped variables
let image_output = null;        // EncryptedFile holder
let encrypted_text = null;      // Textfield Text Value


// -------------------------------------------------------------
// Misc Functions


function enableEncryptButton() {
    document.getElementById("btn-encrypt").disabled = false;
    document.getElementById("btn-encrypt-tooltip").classList.add("permamently-transparent");
}


// -------------------------------------------------------------
// Encoders


function encoder1(pixel3DArray) {
    const temporaryUpsideDownImage = pixel3DArray.reverse();
    return encodeBMPFrom3dData(temporaryUpsideDownImage);
}

function encoder2(pixel3DArray) {
    const temporaryUpsideDownImage = pixel3DArray.reverse();
    return encodeBMPFrom3dData(temporaryUpsideDownImage);
}

function encoder3(pixel3DArray) {
    const temporaryUpsideDownImage = pixel3DArray.reverse();
    return encodeBMPFrom3dData(temporaryUpsideDownImage);
}



// -------------------------------------------------------------
// Actions

// This updates the global text variable on any input change
document.getElementById("crypto-image-message").addEventListener('input', (event) => {
    encrypted_text = event.target.value;
    if (DEBUG) {console.log(encrypted_text);}
});


// After any image file is provided, immiedietly convert
document.getElementById("form-input-image").addEventListener('input', async e => {

    // Retrieve Imagefile
    const file = e.target.files[0];

    // Decode & Create Pixel 3D Array
    const decodedFile = await decodeBMP(file);
    const pixel3dArray = decodedFile.pixels3D;
    if (DEBUG) {console.log(decodedFile);}

    const encodedImage1 = await encoder1(pixel3dArray);
    const encodedImage2 = await encoder2(pixel3dArray);
    const encodedImage3 = await encoder3(pixel3dArray);

    // Output is in global scope
    image_output = new EncryptedFile(file.name, encodedImage1, encodedImage2, encodedImage3);

    // Enable Convert Button
    enableEncryptButton()
});


// This function handles the Encode/Decode actions
document.getElementById("btn-encrypt").addEventListener('click', function(){

    // Downlaod based on checkbox values
    if (checkbox1.checked) { downloadBlob(image_output.encryptedImage1, `encrypted1-${image_output.name}`); }
    if (checkbox2.checked) { downloadBlob(image_output.encryptedImage2, `encrypted2-${image_output.name}`); }
    if (checkbox3.checked) { downloadBlob(image_output.encryptedImage3, `encrypted3-${image_output.name}`); }
});
