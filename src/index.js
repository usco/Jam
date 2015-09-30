//let Cycle = require('cycle-react')
//import App from './App2'
//Cycle.applyToDOM('#root', App)

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

Cycle.run(main, drivers)



//for isomorphic/server side rendering
/*
let context = {}
let componentHtml = React.renderToString(
  React.createElement(App, {context: context})
)*/