<p align="center">
  <img src="./img/logo-transparent.png" alt="CryptoImage" style="height: 60px; margin-top: 15px;">
  <h2 align="center">CryptoImage</h2>
  <h5 align="center">Final Report on the Project for the course</h5> <h5 align="center"><i>"Engineering of Acquiring and Protecting Knowledge from Data and Databases"</i></h5>
  <p align="center">
    <a href="https://luzkan.github.io/CryptoImage/" align="center"><strong>Explore the App »</strong></a>
    <br />
    <a href="https://github.com/Luzkan/CryptoImage/blob/master/README.md">Readme</a>
    ·
    <a href="https://github.com/Luzkan/CryptoImage/issues/new">Report Bug</a>
    ·
    <a href="https://github.com/Luzkan/CryptoImage/issues/new">Request Feature</a>
    ·
    <a href="https://github.com/Luzkan/CryptoImage/blob/master/docs/CHANGELOG.md">Changelog</a>
  </p>
</p>

<br/>
<br/>

# Report

## Abstract

The <a href="https://luzkan.github.io/CryptoImage/">CryptoImage</a> project ended as a great success - both in terms of the functionality and usability. The project was a great learning experience for all of us, and we've learned a lot about the development process based on scientific literature and the importance of documentation. The goal of the project was to provide an usable application that can be used in order to hide and reveal hidden information from image files and we have managed to do so satisfactorily. In addition, we focused on a modern web application which makes the process of hiding and revealing information very convenient as it can be accessed on majority of the platforms without the need to install any software.

<div style="page-break-after: always;"></div>

## Implementation

### **Algorithms**

We have implemented three different algorithms for the hiding process, which are [Differential Expansion](#differential-expansion) ([code](https://github.com/Luzkan/CryptoImage/blob/master/src/algorithms/differential-expansion.ts)), [Histogram Shifting](#histogram-shifting) ([code](https://github.com/Luzkan/CryptoImage/blob/master/src/algorithms/histogram-shifting.ts)) and [Singular Value Decomposition](#Singular-Value-Decomposition) ([code](https://github.com/Luzkan/CryptoImage/blob/master/src/algorithms/singular-value-decomposition.ts)). The application is able to hide information in an image file of `.bmp` format and reveal it back. The results can be instantly inspected and compared with the original image right after the encryption process.

#### **Differential Expansion**

##### [Paper](./papers/.pdf), [Wikipedia - _Differential Form_](https://en.wikipedia.org/wiki/Differential_form)

TBA

#### **Histogram Shifting**

##### [Paper](./papers/.pdf), [Wikipedia - _Histogram_](https://en.wikipedia.org/wiki/Histogram)

TBA

#### **Singular Value Decomposition**

##### [Paper](./papers/.pdf), [Wikipedia - _Singular Value Decomposition_](https://en.wikipedia.org/wiki/Singular_value_decomposition)

TBA

<div style="page-break-after: always;"></div>

### **Web Application**

<div align="center">
    <img src="./img/report/report_homepage.png" alt="Homepage">
    <p style="font-size: 10px">Mainscreen</p>
</div>

#### **Interface Design**

The website is a single page application with a responsive design. Along with the guiding idea, which is cryptography, website is correspondently themed in a dark style with <span style="color: #8c7676; font-weight: 600;">beige</span> accent color. We have even created a customized logo for the application which can be treated as a cherry on top of a full-featured application.

All the actions that user has to perform are placed into one side-column, so he does not get distracted or lost and can just go from top to bottom with quick 3 steps setup.

At the bottom of the main section, there are three counters that are displaying different kind of data about the inserted image which can be cool for some of the users, but mostly it is there for that 'responsive' feel (user immediately sees that the image is being processed and some deep math magic is already happening).


#### **User Experience**

Website is designed to be intuitive and easy to use, responsive to the user actions. To mention few examples - the website has capacity counters for each algorithm, so that user knows instantly whether the message he tries to hide can be hidden in the image or not. If the capacity is exceeded for one of the method, user sees the negative values on capacity and locked download option with red color highlighting. 

Another small _quality of life_ feature is that the error message on the encrypt button will change accordingly to the missing user actions. If the user didn't input a message yet and didn't input an image, the error message will inform about both issues and change accordingly to the actions that user performed.

The images in the result section are initially showcased side-by-side without any information with which kind of algorithm was used to hide the message. The user can hover the image to reveal the algorithm and click it to enlarge it in the lightroom-like fashion. User can further hover on the enlarged image to upscale it a bit further for more detailed inspection and click wherever, to close it.

<div align="center">
    <img src="./img/report/report_image_processing.gif" alt="Image Processing">
    <p style="font-size: 10px">Encrypted Images Section</p>
</div>

Last thing that we can mention, is the automated scroll effect which navigates the user to the results section if he successfully encrypts his data for that smooth _carried-by-the-hand_ feeling.

### **Technicalities**

We've used [TypeScript](https://www.typescriptlang.org/) for the project, which is a great tool for the development of web applications. It is basically a superset of [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) with syntax for types. To keep things simple, we wrote the development `.ts` code and then used `tsc` command to convert it into `.js` files (into the `dist`-tribution directory) that can be executed by everyone through the browser. This `dist`-tribution directory is the one that is served by the application with [Github Pages](https://pages.github.com/).

### **Documentation**

The exhaustive description of the project is available on the [Github](https://github.com/Luzkan/CryptoImage). It covers the introduction, development and the related work (list of research papers). We have also used [changelog](https://keepachangelog.com/en/1.0.0/) which can be found in the `docs` directory [here](https://github.com/Luzkan/CryptoImage/blob/master/docs/CHANGELOG.md).

## Team

- **Marcel Jerzyk** ([github](https://github.com/Luzkan/) / [linkedin](https://www.linkedin.com/in/luzkan/))
- **Krzysztof Szafraniak** ([github](https://github.com/InBinaryWorld) / [linkedin](https://www.linkedin.com/in/krzysztof-szafraniak-18b927207/))
- **Jacek Wernikowski** ([github](https://github.com/werekkk))