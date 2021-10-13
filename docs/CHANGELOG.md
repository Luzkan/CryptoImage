# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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

[diff: 0.1.1-0.2.0]: https://github.com/Luzkan/CryptoImage/compare/0.1.1...0.2.0
[diff: 0.1.0-0.1.1]: https://github.com/Luzkan/CryptoImage/compare/0.1.0...0.1.1
[diff: 0.0.1-0.1.0]: https://github.com/Luzkan/CryptoImage/compare/0.0.1...0.1.0
[diff: 0.0.0-0.0.1]: https://github.com/Luzkan/CryptoImage/compare/0.0.0...0.0.1
[0.2.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.2.0
[0.1.1]: https://github.com/Luzkan/CryptoImage/releases/tag/0.1.1
[0.1.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.1.0
[0.0.1]: https://github.com/Luzkan/CryptoImage/releases/tag/0.0.1
[0.0.0]: https://github.com/Luzkan/CryptoImage/releases/tag/0.0.0
