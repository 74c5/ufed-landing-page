# Landing Page Project

## Introduction

Project files Landing Page Website module of Udacity Nano-degree: [Font End Web Developer](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd0011). 

## Table of Contents

* [Introduction](#introduction)
* [Usage](#usage)
* [Project Structure](#project-structure)
* [Features](#features)
* [Additional Info](#additional-info)


## Usage

To view project, either:
- open github hosted [page](https://74c5.github.io/ufed-landing-page/)
- clone project and host the root folder (e.g. use a local development server like liveserver in VS Code or similar).

NOTE:
Opening the root level _index.html_ locally fails, because the access to the 'app.js' module, using the file protocol, 
is blocked by the CORS policy of modern browsers. i.e. the browser seems to expect the that js modules are always hosted.

## Project Structure

- index.html (base webpage)
- css/styles.css (documents css including active styles)
- js/app.js (main application javascript file)
- js/nav.js (module which creates page nav and links)
- js/tracker.js (module which highlights currently active section, based on percentage of viewport spanned)
- js/scroller.js (module which controls commanded scrolling between document sections).

non-production files:
- design and notes/ - personal files used to create the project, track todos etc.
- demos/ - contains small demo project(s) to trial ideas or figure things out.

other:
- npm, git, eslint configuration files

## Features

Section 1 contains radio buttons for selection of type of scroll used by the main navigation bar.

## Additional Info

Main resources for project:
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web)
- [w3schools](https://www.w3schools.com/)
- [stack **overflow**](https://stackoverflow.com/)