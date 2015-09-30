require("./app.css")
/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {makeDOMDriver, hJSX} from '@cycle/dom'
import Class from "classnames"

import combineTemplate from 'rx.observable.combinetemplate'
let fromEvent = Rx.Observable.fromEvent
let just = Rx.Observable.just
let merge = Rx.Observable.merge
let fromArray = Rx.Observable.fromArray

import {observableDragAndDrop} from './interactions/dragAndDrop'

import SettingsView from './components/SettingsView'

import {postMessageDriver}  from './core/drivers/postMessageDriver'
import {localStorageDriver} from './core/drivers/localStorageDriver'
import {addressbarDriver} from './core/drivers/addressbarDriver'

import {getExtension} from './utils/utils'


function hasModelUrl(data){
  if(data && data.hasOwnProperty("modelUrl")) return true
    return false
}
function hasDesignUrl(data){
  if(data && data.hasOwnProperty("designUrl")) return true
    return false
}

function validateExtension(extensions,entry){
  return extensions.indexOf(getExtension(entry)) > -1
}

function intent(){
  return Rx.Observable.just({foo:"bar"})
}
function model(){
  return Rx.Observable.just("doo")
}



function view({DOM,props$}){
  const settingProps$ = just({
    settings:{
      grid:{show:true}
      ,annotations:{show:true}
      ,camera:{autoRotate:true}
    }
    ,schema : {
      showGrid:{type:"checkbox",path:"grid.show"}
      ,autoRotate:{type:"checkbox",path:"camera.autoRotate"}
      //,annotations:{type:"checkbox",path:"grid.show"}
    }
  })

  let settingsUi = SettingsView({DOM, props$:settingProps$}, "settingsView")
  let settingsView$ = settingsUi.DOM

  return  Rx.Observable.combineLatest(settingsView$,function(settingsView){
    return <div>
      <span> sttuff </span>
      {settingsView}
    </div>
  })
}




/*
extract design source streams 

@param rawSources$: hash of observables/drivers
*/
export function extractDesignSources ( rawSources ){
  
  const {dnd$, addressbar} = rawSources

  //FIXME these are technically untrue, but still should work
  let dndDesignUris$ = dnd$
    .filter(e=> (e.type === "url" || e.type==="text") )
    .pluck("data")
    .flatMap(Observable.fromArray)
    //.filter(url => validMeshExtension(url) )

  let designSources$ = merge(
    addressbar.get("designUrl")
    ,dndDesignUris$
  )

  return designSources$
}

/*
extract mesh source streams 
@param rawSources: hash of observables/drivers
@param extensions: hash of mesh extensions 
*/
function extractMeshSources( rawSources, extensions ){
  extensions = extensions || {
    meshes : ["stl","amf","obj","ctm","ply"]
  }
  const {dnd$, postMessages$, addressbar} = rawSources

  //only load meshes for resources that are ...mesh files
  const validateMeshExtension = validateExtension.bind(null,extensions.meshes)

  //drag & drop sources
  let dndMeshFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)
    .filter(file => validateMeshExtension(file.name) )

  let dndMeshUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data").flatMap(fromArray)
    .filter(url => validateMeshExtension(url) )

  let addressbarMeshUris$ = addressbar.get("modelUrl")

  //sources of meshes
  //meshSources are either urls or files (direct data, passed by drag & drop etc)
  const meshSources$ = merge(
    dndMeshFiles$
    ,dndMeshUris$
    ,postMessages$.filter(hasModelUrl).pluck("modelUrl") //url sent by postMessage
    ,addressbarMeshUris$
  )

  return meshSources$
}

/*
extract source source streams (openscad, openjscad , freecad, etc)
@param rawSources: hash of observables/drivers
@param extensions: hash of mesh extensions 
*/
function extractSourceSources( rawSources, extensions){

  extensions = extensions || {
    meshes : ["scad","jscad","coffee"]
  }
  const {dnd$, postMessages$, addressbar} = rawSources


  //only load meshes for resources that are ...mesh files
  const validateSourceExtension = validateExtension.bind(null,extensions.meshes)

  //drag & drop sources
  let dndSourceFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)
    .filter(file => validateSourceExtension(file.name) )

  let dndSourceUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data").flatMap(fromArray)
    .filter(url => validateSourceExtension(url) )

  let addressbarSourceUris$ = addressbar.get("sourceUrl")

  //sources of meshes
  //meshSources are either urls or files (direct data, passed by drag & drop etc)
  const soureSources$ = merge(
    dndSourceFiles$
    ,dndSourceUris$
    ,postMessages$.filter(hasModelUrl).pluck("sourceUrl") //url sent by postMessage
    ,addressbarSourceUris$
  )

  return soureSources$
}


export function main(drivers) {
  let DOM      = drivers.DOM
  let localStorage = drivers.localStorage
  let addressbar   = drivers.addressbar
  let postMessage  = drivers.postMessage
  //const {DOM,localStorage,addressbar} = drivers

  let dragOvers$  = DOM.select("#root").events("dragover")
  let drops$      = DOM.select("#root").events("drop")  
  let dnd$        = observableDragAndDrop(dragOvers$, drops$) 

  //console.log("DOM",DOM,"localStorage",localStorage)
  //addressbar.get("modelUrl").subscribe(e=>console.log("addressbar",e))

  //Sources of settings
  localStorage.get("jam!-settings").subscribe(e=>console.log("localStorage",e))
  //let appMode    = addressbar.get("appMode").map(d=>d.pop())

  let postMessages$ = postMessage
  const meshSources$ = extractMeshSources({dnd$, postMessages$, addressbar})
  const srcSources$  = extractSourceSources({dnd$, postMessages$, addressbar})

  meshSources$.subscribe(e=>console.log("mesh",e))


  let model$ = model(intent(DOM))
  let v = view({DOM})


  //output to localStorage
  //in our case, settings ?
  const localStorage$ = Rx.Observable.just([
    {"foo": 980},
    {bar: "value2"}
  ])  

  //return anything you want to output to drivers
  return {
      DOM: v
      ,localStorage:localStorage$
  }
}

