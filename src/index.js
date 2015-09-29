//let Cycle = require('cycle-react')
//import App from './App2'
//Cycle.applyToDOM('#root', App)

require("./app.css")
import Cycle from '@cycle/core'
import {makeDOMDriver, hJSX} from '@cycle/dom'

import {main} from './App3'

//////////setup drivers
let domDriver      = makeDOMDriver('#root')

let drivers = {
   DOM: domDriver
}

Cycle.run(main, drivers)



//for isomorphic/server side rendering
/*
let context = {}
let componentHtml = React.renderToString(
  React.createElement(App, {context: context})
)*/