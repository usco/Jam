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

import settings from './core/settings/settings'
import {settingsIntent} from './core/settings/settingsIntent'
import SettingsView from './components/SettingsView'

import FullScreenToggler from './components/FullScreenToggler'

import comments from './core/comments/comments'
import {commentsIntents} from './core/comments/intents'

import BomView from './components/Bom/BomView'

import GLView from './components/webgl/GlView2'


import {getExtension} from './utils/utils'
import {combineLatestObj} from './utils/obsUtils'
import {prepForRender} from './utils/uiUtils'


import {extractDesignSources,extractMeshSources,extractSourceSources} from './core/sources/dataSources'
import {makeTransformsSystem} from './core/entities/entities2'


function intent(){
  return Rx.Observable.just({foo:"bar"})
}
function model(){
  return Rx.Observable.just("doo")
}


function view(state$, DOM, name){
  const settingProps$ = state$//.map(s=>s.settings)
  /*just({
    ,schema : {
      showGrid:{type:"checkbox",path:"grid.show"}
      ,autoRotate:{type:"checkbox",path:"camera.autoRotate"}
      //,annotations:{type:"checkbox",path:"grid.show"}
    }
  })*/

  let settingsUi = SettingsView({DOM, props$:settingProps$})

  let fsTogglerUi = FullScreenToggler({DOM})

  //for bom
  let fieldNames = ["name","qty","unit","version"]
  let sortableFields = ["id","name","qty","unit"]
  let entries = [{id:0,name:"foo",qty:2,version:"0.0.1",unit:"QA"}
  ,{id:1,name:"bar",qty:1,version:"0.2.1",unit:"QA"}
  ]
  //let selectedEntries = selections.bomIds

  let bomProps$ = just({fieldNames,sortableFields,entries})
  let bomUi     = BomView({DOM,props$:bomProps$})

  let testData$ = just(15)

  return prepForRender({fsTogglerUi,settingsUi,bomUi})
    .map(function({settings,fsToggler,bom}){
      return <div>
        {settings}
        {fsToggler}
        {bom}

        {new GLView(testData$)}
      </div>
    })
}

import {makeInternals, meshResources, entityInstanceFromPartTypes} from './core/tbd0'

function registerEntity(sources)
{
  console.log("here")
  let meshSources$ = sources.meshSources$
  let srcSources$ = sources.srcSources$

  //TODO: get rid of this
  let assetManager = makeInternals()
  let meshResources$ = meshResources(meshSources$, assetManager)
  //meshSources$.map(e=>)

  meshResources$.subscribe(e=>console.log("meshResources",e))

  //let entityInstance = undefined
  return meshResources$
}

export function main(drivers) {
  let DOM      = drivers.DOM
  const localStorage = drivers.localStorage
  const addressbar   = drivers.addressbar
  const postMessage  = drivers.postMessage
  //const {DOM,localStorage,addressbar} = drivers

  let dragOvers$  = DOM.select("#root").events("dragover")
  let drops$      = DOM.select("#root").events("drop")  
  let dnd$        = observableDragAndDrop(dragOvers$, drops$) 

  //Sources of settings
  const settingsSources$ = localStorage.get("jam!-settings")
  const settings$ = settings( settingsIntent(drivers), settingsSources$ ) 

  //data sources for our main model
  let postMessages$ = postMessage
  const meshSources$ = extractMeshSources({dnd$, postMessages$, addressbar})
  const srcSources$  = extractSourceSources({dnd$, postMessages$, addressbar})

  const expMeshes$ = registerEntity({meshSources$,srcSources$})

  //comments system
  const comments$ = comments(commentsIntents(DOM,settings$))
  const bom$      = undefined

  let model$ = model(intent(DOM))
  let state$ = combineLatestObj({settings$,meshes$:expMeshes$})
  let view$ = view(state$, DOM)

  //output to localStorage
  //in our case, settings
  const localStorage$ = settings$
    .map( s=>({"jam!-settings":JSON.stringify(s)}) )

  //return anything you want to output to drivers
  return {
      DOM: view$
      ,localStorage:localStorage$
  }
}

