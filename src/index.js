require('./app.css')
import Cycle from '@cycle/core'

import { makeDOMDriver } from '@cycle/dom'
import postMessageDriver from './drivers/postMessageDriver'
import addressbarDriver from './drivers/addressbarDriver'
import browserCapsDriver from './drivers/browserCapabilities'
import appMetaDataDriver from './drivers/appMetaDataDriver'
import eventDriver from './drivers/eventDriver'

import makeHttpDriver from 'cycle-simple-http-driver'
import localStorageDriver from './drivers/localStorageDriver'
import makeDesktopDriver from './drivers/desktopStoreDriver'
import makeYMDriver from 'usco-ym-storage'
import fileStorageDriver from './drivers/fileStorageDriver'
import clipBoardDriver from './drivers/clipBoardDriver'


import main from './components/main/index'


// ////////setup drivers
const domDriver = makeDOMDriver('#jamRoot')
// other drivers
const postMessage = postMessageDriver
const localStorage = localStorageDriver
const addressbar = addressbarDriver
const browserCaps = browserCapsDriver
const httpDriver = makeHttpDriver()
const desktopStoreDriver = makeDesktopDriver()
const ymDriver = makeYMDriver(httpDriver)
const fileStorage = fileStorageDriver
const clipBoard = clipBoardDriver


let drivers = {
  DOM: domDriver,
  postMessage,
  addressbar,
  browserCaps,
  events: eventDriver,
  appMeta: appMetaDataDriver,
  // storage etc
  localStorage,
  http: httpDriver,
  desktop: desktopStoreDriver,
  fileStorage,
  clipBoard,

  ym: ymDriver
}

console.log('---READY TO START JAM!---')
const mode = 'production'
if (mode === 'production') {
  // remove console.log statements // FIXME: temporary hack
  console._log = console.log
  console._info = console.info
  console._warn = console.warn
  console.log = function () {}
  console.info = function () {}
  console.warn = function () {}
}

Cycle.run(main, drivers)
