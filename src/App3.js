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
@param dndSources$: observable of drag and drops
@params urlSources: observable of url sources
*/
export function extractDesignSources ( dndSources$, urlSources ){
  
  //FIXME these are technically untrue, but still should work
  let dndDesignUris$ = dndSources$
    .filter(e=> (e.type === "url" || e.type==="text") )
    .pluck("data")
    .flatMap(Observable.fromArray)
    //.filter(url => validMeshExtension(url) )

  let designSources$ = merge(
    urlSources.designUri$,
    dndDesignUris$
  )

  return {meshSources$, designSources$}
}


function extractMeshSources(rawSources, extensions){
  let _extensions = extensions || {
    meshes : ["stl","amf","obj","ctm","ply"]
  }
  const {dnd$, postMessages$, addressbar} = rawSources

  //only load meshes for resources that are ...mesh files
  const validateMeshExtension = validateExtension.bind(null,_extensions.meshes)

  //drag & drop sources
  let dndMeshFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)
    .filter(file => validateMeshExtension(file.name) )

  let dndMeshUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data").flatMap(fromArray)
    .filter(url => validateMeshExtension(url) )

  let addressbarMeshUris$ = addressbar.get("modelUrl")

  //sources of meshes
  //meshSources is either url or file (direct data, passed by drag & drop etc)
  const meshSources$ = merge(
    dndMeshFiles$
    ,dndMeshUris$
    ,postMessages$.filter(hasModelUrl).pluck("modelUrl") //url sent by postMessage
    ,addressbarMeshUris$
  )

  return meshSources$
}


export function main(drivers) {
  let DOM      = drivers.DOM

  let dragOvers$  = DOM.select("#root").events("dragover")
  let drops$      = DOM.select("#root").events("drop")  
  let dnd$        = observableDragAndDrop(dragOvers$, drops$) 

  //other drivers
  let postMessages$ = postMessageDriver( )  
  let localStorage = localStorageDriver( )
  let addressbar   = addressbarDriver( )

  //console.log("DOM",DOM,"localStorage",localStorage)
  //addressbar.get("modelUrl").subscribe(e=>console.log("addressbar",e))

  //Sources of settings
  localStorage.get("jam!-settings").subscribe(e=>console.log("localStorage",e))

  const meshSources$ = extractMeshSources({dnd$, postMessages$, addressbar})
  meshSources$.subscribe(e=>console.log("mesh",e))


  let model$ = model(intent(DOM))
  let v = view({DOM})

  return {
      DOM: v
  }
}

