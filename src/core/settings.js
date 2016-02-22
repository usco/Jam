import Rx from 'rx'
const Observable = Rx.Observable
const {merge, fromEvent, of} = Rx.Observable
import {makeModel, mergeData} from '../utils/modelUtils'


function setAllValues(state, input){
  //console.log("setting settings")
  //TODO : do validation ?
  //we coerce appMode to "editor" when setting all values like this
  let output = mergeData( state, mergeData( input, {appMode:"editor"})  )
  return output
}

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
  let toolSets = undefined
  if(input === 'viewer'){
    toolSets = ['view']
  }else if(input==='editor'){
    toolSets = ['view','edit']
  }
  console.log("toolSets",toolSets)
  let output = mergeData( state, {toolSets})
  console.log("setting app mode",input)
  return output
}

function setToolsets(state, input){
  let output = mergeData( state, {toolSets:input})
  //console.log("setting app mode",output)
  return output
}

function settings(actions, source){
  //source = source || Rx.Observable.never()
  //source = source.map(src => mergeData( src, {appMode:"editor"}) )//default appMode to editor, disregard saved settings

  ///defaults, what else ?
  const defaults = {
    webglEnabled:true,
    appMode:"editor",
    autoSelectNewEntities:true,
    activeTool:undefined,
    repeatTool:false,

    toolSets:["view","edit","annotate"],//what categories of tools do we want on screen

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

  let updateFns  = {setAllValues, toggleShowGrid, toggleAutoRotate, setActiveTool, setAppMode, setToolsets}
  return makeModel(defaults, updateFns, actions, source)
}

export default settings
