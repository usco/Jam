require("./app.css")
import Cycle from '@cycle/core'
import {makeDOMDriver, hJSX} from '@cycle/dom'

import {main} from './App3'

import {postMessageDriver}  from './core/drivers/postMessageDriver'
import {localStorageDriver} from './core/drivers/localStorageDriver'
import {addressbarDriver} from './core/drivers/addressbarDriver'
import browserCapsDriver from './core/drivers/browserCapabilities'


//////////setup drivers
let domDriver      = makeDOMDriver('#root')
//other drivers
let postMessage  = postMessageDriver  
let localStorage = localStorageDriver
let addressbar   = addressbarDriver
let browserCaps  = browserCapsDriver

let drivers = {
   DOM: domDriver
   ,localStorage
   ,postMessage
   ,addressbar
   ,browserCaps
}

console.log("---READY TO START JAM!---v 0.2.3")

Cycle.run(main, drivers)

//for isomorphic/server side rendering
//TODO: complete this