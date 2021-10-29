# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [[0.6.0]] - 2021-10-29 _(MJ)_

**The Project from now is written in TypeScript. 🎉**

###### _([diff: 0.5.1-0.6.0])_

Added:

- TypeScript configuration [`tsconfig.json`](../tsconfig.json).
- New development section in [`README.md`](../README.md#Development).

Changed:

- All the source code files from `/src/` from `.js` to `.ts`.

TODO:

- Not everything is typed yet, tiny bit of work left to do.

## [[0.5.1]] - 2021-10-29 _(MJ)_

###### _([diff: 0.5.0-0.5.1])_

Added:

- `pixel3DArrayToChannelArray()` implementation in [`histogram-shifting.js`](../src/algorithms/histogram-shifting.js)

## [[0.5.0]] - 2021-10-26 _(JW)_

###### _([diff: 0.4.1-0.5.0])_

Added:

- [_Reversible Data Hiding_](./docs/papers/Reversible_data_hiding.pdf) - a paper on histogram shifting
- Directory `/src/algorithms/` with three javascript files containg basic structure of three chosen encryption methods

Changed:

- `main.js` now invokes the (not yet finished) encryption methods of the `/src/algorithms/` directory instead of the sample methods from `/src/algorithms.js` (which was removed)

## [[0.4.1]] - 2021-10-26 _(MJ)_

###### _([diff: 0.4.0-0.4.1])_

Changed:

- Moved encoders from `main.js` to separate [`algorithms.js`](../src/algorithms.js) file
- Moved `bmp-encoder-decoder.js` to separate [`/src/encoders`](../src/encoders) directory and renamed it to [`bmp.js`](../src/encoders/bmp.js)

## [[0.4.0]] - 2021-10-26 _(MJ)_

###### _([diff: 0.3.0-0.4.0])_

**Converter Form responsiveness.**

Added:

- Prepared the [`main.js`](../src/main.js) for the user usage-flow logic handling & tiny structurization
  - Temporary downloads example based on the checkbox inputs
  - Variable which holds the text for encryption with on-key-change updates
  - Functions and logic checks for each encryption method
  - Variables holding the counter labels
- Some ID's in the index.html to get the HTML elements
- Constraint for the input, limited _(currently)_ only to `.bmp` filetype
- Tooltip for Encoder Button
  - Disabled it by default
  - After user uploads an image, it is enabled
  - If he tries to press the button before uploading an image, a tooltip will apear
  - Tooltip is hidden after the image is uploaded
  - ![CI - CryptoImage logo](./img/changelog/button_tooltip.gif)

Changed:

- Moved the examples from [`main.js`](../src/main.js) to [`examples.js`](../src/examples.js)

## [[0.3.0]] - 2021-10-21 _(KS)_

###### _([diff: 0.2.0-0.3.0])_

**BMP Decoder / Encoder class & Blob Downloader.**

Added:

- BMP Encoder / Decoder
  - Properties:
    - `bytesPerPixel`
    - `fileSize`
    - `height`
    - `width`
    - `plainPixelsData`
    - `pixels3D`
- Blob Downloader

## [[0.2.0]] - 2021-10-13 _(MJ)_

###### _([diff: 0.1.1-0.2.0])_

**Massive Update. Fully styled website on which we are going to implement stuff.**

Added:

- **Styled Website** inside the main directory. Website should be available [here](https://luzkan.github.io/CryptoImage/).
- Website is divided into three sections:
  - _Main Encoder/Decoder_
    - There is a place for a future [`canvas`](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) which can be used to transform & manipulate the image ([hint](https://stackoverflow.com/questions/7373851/reading-the-rgb-value-of-a-canvas-pixel))
    - Simple three steps for the user:
      1. Image Upload
      2. Desired Method conversion checkboxes
      3. Message Textfield
    - Counters which indicate the total space, available space and encrypted header decode message in `KB's`,
    - ![0.2.0 Section Main](./img/changelog/020_section_main.png)
  - _Results_
    - Presented as images based on the previously checked checkboxes + the original/decoded image.
    - ![0.2.0 Section Main](./img/changelog/020_section_results.png)
  - _Credits_
    - Section to gain some social credit for us if the project succeed. _xD_
    - ![0.2.0 Section Main](./img/changelog/020_section_credits.png)
- Everything website related can be found in the [`assets`](../assets) directory - the [_vendor javascripts_](../assets/js), [_css_](../assets/css), [_fonts_](../assets/fonts) and [_images_](../assets/images).
- Logo for our project! 🎉
  - ![CI - CryptoImage logo](./img/logo.png)
  - Corresponding `.ico` file was added in [`./assets/icons/favicon.ico`](../assets/icons/favicon.ico)
- Updated `README.md` with link to the website.

## [[0.1.1]] - 2021-10-11 _(MJ)_

###### _([diff: 0.1.0-0.1.1])_

**Tiny update w/ team members.**

Added:

- _Team_ section in [**`README.md`**](../README.md).

## [[0.1.0]] - 2021-10-10 _(JW)_

###### _([diff: 0.0.1-0.1.0])_

**Articles related to the subject of the project have been linked.**

Added:

- 4 articles related to the project into `/docs/papers/` directory:

  - [_Analiza właściwości metod steganografii odwracalnej._](./docs/papers/Analysis_of_properties_of_reversible_steganography_methods.pdf)
  - [_Lossless generalized-LSB data embedding._](./docs/papers/Lossless_generalized-LSB_data_embedding.pdf)
  - [_Efficient Image Reversible Data Hiding Technique Based on Interpolation Optimization._](./docs/papers/Efficient_image_reversible_data_hiding_technique_based_on_interpolation_optimization.pdf)
  - [_Comparative study on different reversible image data hiding techniques._](./docs/papers/Comparative_study_on_different_reversible_image_data_hiding_techniques.pdf)

- _Related work_ section to [**`README.md`**](../README.md).

## [[0.0.1]] - 2021-10-17 _(MJ)_

###### _([diff: 0.0.0-0.0.1])_

Added:

- Created [**`DevelopmentWorkCulture.md`**](../docs/DevelopmentWorkCulture.md) for the project that contains some rules how we can make working together easier.

## [[0.0.0]] - 2021-10-07 _(MJ)_

**Project was initialized.**

### Added

- Created [**`CHANGELOG.md`**](../docs/CHANGELOG.md) for the project that contains the history of changes for this project.
- Created [**`README.md`**](../README.md) for the project that contains various useful information, requirements and instructions in order ot run the program.

[diff: 0.5.1-0.6.0]: https://github.com/Luzkan/CryptoImage/compare/0.5.1...0.6.0
[diff: 0.5.0-0.5.1]: https://github.com/Luzkan/CryptoImage/compare/0.5.0...0.5.1
[diff: 0.4.1-0.5.0]: https://github.com/Luzkan/CryptoImage/compare/0.4.1...0.5.0
[diff: 0.4.0-0.4.1]: https://github.com/Luzkan/CryptoImage/compare/0.4.0...0.4.1
[diff: 0.3.0-0.4.0]: https://github.com/Luzkan/CryptoImage/compare/0.3.0...0.4.0
[diff: 0.2.0-0.3.0]: https://github.com/Luzkan/CryptoImage/compare/0.2.0...0.3.0
[diff: 0.1.1-0.2.0]: https://github.com/Luzkan/CryptoImage/compare/0.1.1...0.2.0
[diff: 0.1.0-0.1.1]: https://github.com/Luzkan/CryptoImage/compare/0.1.0...0.1.1
[diff: 0.0.1-0.1.0]: https://github.com/Luzkan/CryptoImage/compare/0.0.1...0.1.0
[diff: 0.0.0-0.0.1]: https://github.com/Luzkan/CryptoImage/compare/0.0.0...0.0.1
[0.6.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.5.1
[0.5.1]: https://github.com/Luzkan/CryptoImage/releases/tag/0.5.1
[0.5.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.5.0
[0.4.1]: https://github.com/Luzkan/CryptoImage/releases/tag/0.4.1
[0.4.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.4.0
[0.3.1]: https://github.com/Luzkan/CryptoImage/releases/tag/0.3.1
[0.3.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.3.0
[0.2.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.2.0
[0.1.1]: https://github.com/Luzkan/CryptoImage/releases/tag/0.1.1
[0.1.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.1.0
[0.0.1]: https://github.com/Luzkan/CryptoImage/releases/tag/0.0.1
[0.0.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.0.0
