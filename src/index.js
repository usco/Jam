require("./app.css")
import Cycle from '@cycle/core'
import {makeDOMDriver, hJSX} from '@cycle/dom'

import main from './components/main/index'

import postMessageDriver  from './core/drivers/postMessageDriver'
import addressbarDriver   from './core/drivers/addressbarDriver'
import browserCapsDriver  from './core/drivers/browserCapabilities'
import appMetaDataDriver  from './core/drivers/appMetaDataDriver'
import eventDriver        from './core/drivers/eventDriver'

import makeHttpDriver     from 'cycle-simple-http-driver'
import localStorageDriver from './core/drivers/localStorageDriver'
import makeDesktopDriver  from './core/drivers/desktopStoreDriver'
import makeYMDriver       from './core/drivers/youMagineDriver'


//////////setup drivers
let domDriver      = makeDOMDriver('#jamRoot')
//other drivers
let postMessage  = postMessageDriver
let localStorage = localStorageDriver
let addressbar   = addressbarDriver
let browserCaps  = browserCapsDriver
let httpDriver   = makeHttpDriver()
let desktopStoreDriver = makeDesktopDriver()
let ymDriver     = makeYMDriver(httpDriver)

let drivers = {
   DOM: domDriver
   ,postMessage
   ,addressbar
   ,browserCaps
   ,events:eventDriver
   ,appMeta:appMetaDataDriver

   //storage etc
   ,localStorage
   ,http:httpDriver
   ,desktop:desktopStoreDriver
   ,ym:ymDriver
}


console.log("---READY TO START JAM!---")
const mode = "production"
if(mode==="production"){
  //remove console.log statements // FIXME: temporary hack
  console._log = console.log
  console._info = console.info
  console._warn = console.warn
  console.log  = function(){}
  console.info = function(){}
  console.warn = function(){}
}


Cycle.run(main, drivers)

//for isomorphic/server side rendering
//TODO: complete this
