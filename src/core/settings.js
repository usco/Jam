import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge
import combineTemplate from 'rx.observable.combinetemplate'
import {makeModel, mergeData} from '../utils/modelUtils'


function toggleShowGrid(state, input){
  console.log("toggleShowGrid",input)
  let output = mergeData( state, {grid:{show:input}} )
  return output
}

function toggleShowAnnot(state, input){
  console.log("toggleShowAnnot",input)
  let output = mergeData( state, {annotations:{show:input}} )
  return output
}

function toggleAutoRotate(state, input){
  console.log("toggleAutoRotate",input)
  let output = mergeData( state, {camera:{autoRotate:input}} )
  return output
}

function setActiveTool(state, input){
  let output = mergeData( state, {activeTool:input})
  console.log("setting activeTool",input)
  return output
}

function setAppMode(state, input){
  let output = mergeData( state, {appMode:input})
  console.log("setting app mode",input)
  return output
}

function settings(actions, source){
  source = source.map(src => mergeData( src, {appMode:"editor"}) )//default appMode to editor, disregard saved settings
  ///defaults, what else ?
  const defaults = {
    webglEnabled:true,
    mode:"editor",
    autoSelectNewEntities:true,
    activeTool:undefined,
    repeatTool:false,

    selections: undefined,

    //these are "domain specific", there should be a way for sub systems
    //to "hook up" to the main data storage
    camera:{
      autoRotate:false
    },
    grid:{
      show:true
    },
    annotations:{
      show:true
    }
  }

  let updateFns  = {toggleShowGrid, toggleAutoRotate, setActiveTool, setAppMode}
  return makeModel(defaults, updateFns, actions, source)
}

export default settings