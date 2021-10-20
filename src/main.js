

// // examples:
// const fileInput = document.querySelector('#formFileSm');
//
// // 3D array : 3 rows x 2 cols x 3 channels
// const pixels3dData = [
//     [[0, 0, 0], [255, 255, 255]],
//     [[255, 255, 255], [0, 0, 0]],
//     [[0, 0, 0], [255, 255, 255]],
// ]
//
// encodeBMPFrom3dData(pixels3dData)
//     .then(blob => decodeBMP(blob))
//     .then(dec => console.log(dec))
//
// // Flat array : 3 rows x 2 cols x 3 channels
// const flatPixelData = [
//     0, 0, 0, 255, 255, 255,
//     255, 255, 255, 0, 0, 0,
//     0, 0, 0, 255, 255, 255,
// ]
//
// encodeBMP(flatPixelData, 2, 3)
//     .then(blob => decodeBMP(blob))
//     .then(dec => console.log(dec))

//
// // Download blob:
// encodeBMPFrom3dData(pixels3dData)
//     .then(blob => downloadBlob(blob, "hello-world.bmp"));
//
//
// // modify image:
// fileInput.addEventListener('input', async e => {
//     const file = e.target.files[0];
//     const decodedFile = await decodeBMP(file);
//     const pixel3dArray = decodedFile.pixels3D;
//     console.log(decodedFile)
//
//     // Make image upside down
//     const upsideDownImg = pixel3dArray.reverse();
//
//     const blob = await encodeBMPFrom3dData(upsideDownImg);
//     downloadBlob(blob, 'upside-down-' + file.name);
// });