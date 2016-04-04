## Jam!

[![GitHub version](https://badge.fury.io/gh/usco%2FJam.svg)](https://badge.fury.io/gh/usco%2Fjam)

<img src="https://raw.githubusercontent.com/usco/Jam/master/screenshot.png" />


> View , annotate , measure 3d designs & more !


## Installing

```sh
npm install usco/jam
```

## Running (dev mode only for now)

```sh
npm start
```

## General information

 - work in progress ! But already in action at [YouMagine](https://www.youmagine.com/) every time you view a 3d model
 - uses [Cycle.js](http://cycle.js.org/) and Observables ([rxjs](https://github.com/Reactive-Extensions/RxJS), [most](https://github.com/cujojs/most) in the future) at its core
 - strives to be functional oriented overall
 - uses [three.js](https://github.com/mrdoob/three.js/) for the 3d visuals
 - writen in es6/es2015 , with [Babel](https://babeljs.io/)
 - uses [Webpack](http://webpack.github.io/) (main app) and/or [browserify](http://browserify.org/) (parsers)

## Features:
 - support for a variety of 3d file formats (stl, ctm , 3mf, obj etc)
 - BOM (Bill of material support)
 - comment on a design as a whole or on individual parts (no backend support yet)
 - more than just geometry: tries to infer "metadata" from "dumb" formats like stl: infering Part names, BOM amounts etc
 - fast : only re-renders / updates when responding to user actions
 - modular (up to a point) : all 3d file format parsers etc are independant npm modules , optimised to run fast and get out of the way
 - can also do server side rendering using webgl (just thumbnails)

## Future:
  - measurements  (already in there , but buggy)
  - more complex editing (part hiearchies, various joint types)
  - a lot more



This software is being developped with passion at [Youmagine.com](https://www.youmagine.com/) :)

## LICENSE

[The AGLP License (AGPL)](https://github.com/usco/Jam/blob/master/LICENSE)

- - -
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![Build Status](https://travis-ci.org/usco/Jam.svg?branch=master)](https://travis-ci.org/usco/Jam)
[![Dependency Status](https://david-dm.org/usco/jam.svg)](https://david-dm.org/usco/jam)
[![devDependency Status](https://david-dm.org/usco/jam/dev-status.svg)](https://david-dm.org/usco/jam#info=devDependencies)
