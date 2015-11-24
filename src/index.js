require("./app.css")
import Cycle from '@cycle/core'
import {makeDOMDriver, hJSX} from '@cycle/dom'

import main from './components/main/index'

import postMessageDriver  from './core/drivers/postMessageDriver'
import localStorageDriver from './core/drivers/localStorageDriver'
import addressbarDriver   from './core/drivers/addressbarDriver'
import browserCapsDriver  from './core/drivers/browserCapabilities'
import eventDriver        from './core/drivers/eventDriver'
import makeHttpDriver     from './core/drivers/simpleHttpDriver'
import makeDesktopDriver  from './core/drivers/desktopStoreDriver'


//////////setup drivers
let domDriver      = makeDOMDriver('#root')
//other drivers
let postMessage  = postMessageDriver  
let localStorage = localStorageDriver
let addressbar   = addressbarDriver
let browserCaps  = browserCapsDriver
let httpDriver   = makeHttpDriver()
let desktopStoreDriver = makeDesktopDriver()

let drivers = {
   DOM: domDriver
   ,localStorage
   ,postMessage
   ,addressbar
   ,browserCaps
   ,events:eventDriver

   ,http:httpDriver
   ,desktop:desktopStoreDriver
}

console.log("---READY TO START JAM!---")

Cycle.run(main, drivers)

//for isomorphic/server side rendering
//TODO: complete this