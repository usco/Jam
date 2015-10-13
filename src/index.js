require("./app.css")
import Cycle from '@cycle/core'
import {makeDOMDriver, hJSX} from '@cycle/dom'

import main from './components/main/index'

import {postMessageDriver}  from './core/drivers/postMessageDriver'
import {localStorageDriver} from './core/drivers/localStorageDriver'
import {addressbarDriver} from './core/drivers/addressbarDriver'
import browserCapsDriver from './core/drivers/browserCapabilities'

//test hack/helper driver
function eventDriver(outgoing$){
  outgoing$ = outgoing$ || Cycle.Rx.Observable.just({})

  function deep_value(path, obj){
    try{
      for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
        obj = obj[path[i]]
      }
      return obj
    }
    catch(error){}
  }

  function getData(path){

    return outgoing$.map( deep_value.bind(null,path) ).filter(e=>e!==undefined)
  }

  return {
    select: getData
  }
}

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
   ,events:eventDriver
}

console.log("---READY TO START JAM!---v 0.2.3")

Cycle.run(main, drivers)

//for isomorphic/server side rendering
//TODO: complete this