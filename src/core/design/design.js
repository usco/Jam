import assign from 'fast.js/object/assign'//faster object.assign
import logger from 'log-minim'
let log = logger("design")
log.setLevel("error")

import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

const defaults = {
   name       : undefined
  ,description: undefined
  ,version    : undefined//"0.0.0",
  ,authors    : []
  ,tags       : []
  ,licenses   : []
  ,meta       : undefined
  
  ,id         : undefined
  ,uri        : undefined
}


function newDesign(state, input){
  let design = assign({}, defaults)
  return design
}

function updateDesign(state, input){
  log.info("setting design data", input)
  let design = assign({}, state, input)
  return design
}


function model(actions, source){
  let updateFns  = {newDesign, updateDesign}
  return makeModel(defaults, updateFns, actions, undefined, {doApplyTransform:false})//since we store meshes, we cannot use immutable data
}

export default model