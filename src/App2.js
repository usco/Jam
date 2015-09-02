require("./app.css")

let Cycle = require('cycle-react')
let React = require('react')
import Rx from 'rx'
import combineTemplate from 'rx.observable.combinetemplate'

import GlView from './components/webgl/GlView'
import BomView from './components/Bom/BomView'
import SettingsView from './components/SettingsView'
import FullScreenToggler from './components/FullScreenToggler'
import ContextMenu from './components/ContextMenu'
import EntityInfos from './components/EntityInfos'
import MainToolbar from './components/MainToolbar'

import {observableDragAndDrop} from './interactions/dragAndDrop'

import settings from './core/settings/settings'

import {settingsIntent} from './core/settings/settingsIntent'


//bom
import Bom from './core/bom/bom'
import {bomIntents, entriesFromEntities} from './core/bom/intents'

//entities
import {entityIntents, annotationIntents} from './core/entities/intents'
import entities from './core/entities/entities'
import {addAnnotationMod} from './core/entities/annotations'

//comments
import {commentsIntents} from './core/comments/intents'
import comments from './core/comments/comments'

//selections
import {selectionsIntents,reverseSelections} from './core/selections/intents'
import selections from './core/selections/selections'

//history
import {historyIntents} from './core/historyIntents'


//temporary
import {makeInternals, meshResources, entityInstanceFromPartTypes} from './core/tbd0'
import {getVisual,createVisualMapper} from './core/entities/entitiesToVisuals'

import {exists} from './utils/obsUtils'

//NEEDED because of circular dependency ...
import {clearActiveTool$} from './actions/appActions'

import appMetadata$ from './core/drivers/appMetaDriver'

 


function hasModelUrl(data){
  if(data && data.hasOwnProperty("modelUrl")) return true
    return false
}
function hasDesignUrl(data){
  if(data && data.hasOwnProperty("designUrl")) return true
    return false
}

function sources(urlSources$, dndSources$){
  //data sources (drivers)
  let dataSources = require('./core/sources/dataSources').getDataSources
  let urlSources = require('./core/sources/urlSources')

  let {meshSources$, designSources$} = dataSources(dndSources$, urlSources)

  const safeJSONParse = str => JSON.parse(str) || {} //from cycle.js 

  let lsSettings$ = Rx.Observable.just(
    localStorage.getItem("jam!-settings")
  )
    .map(safeJSONParse)
  
  let settingsSources$ = lsSettings$ //Rx.Observable.just({})//


  let postMessages$ = require('./core/drivers/postMessageDriver')( )  
  meshSources$   =  meshSources$.merge( postMessages$.filter(hasModelUrl).pluck("modelUrl") )
  //designSources$ =  designSources$.merge( postMessages$.filter(hasDesignUrl).pluck("designUrl") )

  return {meshSources$, designSources$, settingsSources$}
}  


function getEntitiesMenuItems(entities){
 let menuItems = [
    {text:"DeleteAll",action:"deleteAll"}
  ]

  let hasParts = ( entities.filter(e=>e.cid === 0) ) .length > 0
  let hasAnnots= ( entities.filter(e=>e.cid !== 0) ) .length > 0

  if(hasParts || hasAnnots){
    menuItems= menuItems.concat([
        {text:"Duplicate", action:"duplicate"}
        ,{text:"Delete",action:"delete"}

      ])
  }

  if(hasParts && !hasAnnots){
    menuItems= menuItems.concat(
      [
        {text:"transforms",items:[
          {text:"translate", action:"translate"}
          ,{text:"rotate",action:"rotate"}
          ,{text:"scale",action:"scale"}
        ]}
        ,

        {text:"annotations",items:[
        {text:"Add note", action:"addNote"},
        {text:"Measure thickness",action:"measureThickness"},
        {text:"Measure Diameter",action:"measureDiameter"},
        {text:"Measure Distance",action:"measureDistance"},
        {text:"Measure Angle",action:"measureAngle"}
        ]}
      ]
    )
  }

  return menuItems
}

function App(interactions) {
  document.addEventListener("keyup", interactions.subject('keyup').onEvent)

  let dragOvers$  = interactions.subject("dragover")
  let drops$      = interactions.subject("drop")  
  let dndSources$ = observableDragAndDrop(dragOvers$, drops$)  
  let urlSources$ =null

  let {meshSources$, designSources$, settingsSources$} = sources(urlSources$, dndSources$)

  let settings$ = settings( settingsIntent(interactions), settingsSources$ )  

  //let settingsAlt$ = settingsAlt( settingsIntent(interactions), settingsSources$ )

  settings$.distinctUntilChanged().subscribe(e=>console.log("settings$DISTINCT",e))
  //settings$.subscribe(e=>console.log("settings$",e))

  ///////////////
  let assetManager = makeInternals()

  let meshResources$ = meshResources(meshSources$, assetManager)

  let intents = entityIntents(interactions)  

  //register meshes <=> types
  let registry = require('./core/entities/registry')
  let partTypes$ = registry({
    combos$:meshResources$
    ,reset$: intents.deleteAllInstances$
  })

  //get new instances from "types"
  let newInstFromTypes$ = entityInstanceFromPartTypes(partTypes$)
  ///////////////

  //annotations
  let aIntents = annotationIntents(interactions)
  let aIntent = {
    creationStep$:aIntents.creationStep$,
    settings$:settings$
  }
  let addAnnotation$ = addAnnotationMod(aIntent)

  addAnnotation$
    .withLatestFrom(settings$,function(annotation,settings){
      if(!settings.repeatTool){
        clearActiveTool$()
      }
      //console.log("ok I am done with annotation",annotation,settings)
    })
    .subscribe(e=>e)

  let addInstance$ = newInstFromTypes$.merge(addAnnotation$)
  
  function remapEntityIntents(intent, addInstance$, settings$){
    return  {
      createInstance$:new Rx.Subject(),//createInstance$,
      addInstances$: addInstance$,

      updateInstance$: intent.selectionTransforms$,//
      deleteInstances$: intent.deleteInstances$,
      duplicateInstances$: intent.duplicateInstances$,  
      deleteAllInstances$: intent.deleteAllInstances$, 

      replaceAll$:intent.replaceAll$,
      settings$:settings$
    }
  }
  //entities
  let entities$ = entities(remapEntityIntents(intents,addInstance$,settings$))

  //comments
  let comments$ = comments(commentsIntents(interactions, settings$))

  //bom
  let bomIntent = entriesFromEntities( bomIntents(interactions), entities$ )
  bomIntent.partTypes$ = partTypes$
  bomIntent.combos$    = meshResources$
 
  let bom$ = Bom(bomIntent)


  //output (USE DRIVER!!!!)
  settings$.subscribe(function(settings){
    console.log("settings, to save etc",settings)
    localStorage.setItem("jam!-settings",JSON.stringify(settings) )
  })

  let {getVisual,addVisualProvider } = createVisualMapper(partTypes$, entities$)

  //selections 
  let selections$ = selections( reverseSelections(selectionsIntents(interactions),entities$) )

  //undo redo
  let historyActions = historyIntents(interactions)
  let history$ = new Rx.BehaviorSubject({
    undos:[],
    redos:[]
  })

  entities$
    //.pluck("instances")
    //.distinctUntilChanged()
    .withLatestFrom(history$,function(entities,history){
      console.log("updating history",entities)
      history.undos.push(entities)
    })
    .subscribe(e=>e)


  Rx.Observable.merge(
    historyActions.undo$,
    historyActions.redo$
  )
    .withLatestFrom(history$,function(u,history){
      let {undos,redos} = history

      let source = undos//either undo or redo
      let target = redos//either redo or undo 
      if(!u){ 
        console.log("redoing", redos)
        source = redos 
        target = undos
      }else{
        console.log("undoing", undos)
      }

      let last = source.pop()
      if(last){
        target.push(last)
        history$.onNext({
          undos
          ,redos
        })

        //TODO: how do we set the entities data ?
        //intents.replaceAll$.onNext(last)
      }

    })
    .subscribe(e=>e)


  //TODO:remove
  let contextTaps$ = intents.contextTaps$

  //semi hack : used only for viewer mode for now
  let loading$ = Rx.Observable.merge(
      meshSources$
        .map(true)
      ,addInstance$
        .map(false)
    ).startWith(false)

    
  meshSources$.subscribe(e=>console.log("meshResources",meshResources))

  console.log("---READY TO START JAM!---v 0.2.0")

    
  return Rx.Observable
    .combineLatest(
      entities$,
      bom$,
      settings$,
      contextTaps$
      ,history$
      ,comments$
      ,selections$
      ,loading$
      ,function(items, bom, settings, contextTaps, history, comments, selections,loading){

        console.log("re-render")
        let {undos,redos} = history

        //for bom
        let fieldNames = ["name","qty","unit","version"]
        let sortableFields = ["id","name","qty","unit"]
        let entries = bom.entries
        let selectedEntries = selections.bomIds

        //deal with context menu entries
        let selectedEntities = selections.selectedIds.map( id=>items.byId[id] )       
        let contextMenuItems = getEntitiesMenuItems(selectedEntities)

        let settingsMeta = [
          {type:"checkbox", label:"Show Grid", className:"showGrid"}
        ]


        //spinner /loader
        let loaderSpinner = null
       
        let _loading = (loading && settings.mode === "viewer" && settings.webglEnabled)
        if(_loading){
          loaderSpinner = <span className="spinner" /> 
        }


        function renderWebglError(){
          return (
            <div className="mainError">
              <span>
                <div className="container-heading">
                  <h1>Whoops, it seems you do not have a WebGL capable browser, sorry!</h1>
                </div>
                <div className="container-text">
                  <span> <a href="https://get.webgl.org/"> Find out more here  </a> </span>
                </div>
              </span>
            </div>
          )
        }
        
        function normalContent(settings, items, contextTaps, comments){
          let _selections = selections.selectedIds.map( id=>items.byId[id] )
          //console.log("selections",selections,"items",items,"annotations",annotations)
          let _items = items.instances

          let elements = (
            <div>
              <GlView 
              settings={settings}
              items={_items} 
              selections={_selections}
              visualMappings={getVisual}
              className="glview"/>

              <SettingsView settings={settings} ></SettingsView>
              <FullScreenToggler/> 
            </div>
          )
          //<MainToolbar />
          //               

          if(settings.mode === "editor"){
            elements =(
              <div>
                <GlView 
                settings={settings}
                items={_items} 
                selections={_selections}
                visualMappings={getVisual}
                className="glview"/>
                
                <SettingsView settings={settings} ></SettingsView>
                <ContextMenu position={contextTaps} items={contextMenuItems} selections={_selections}/>
                
                <EntityInfos entities={_selections} settings={settings} comments={comments}/>

                <BomView 
                  entries={entries} 
                  selectedEntries = {selectedEntries}
                  fieldNames={fieldNames} 
                  sortableFields={sortableFields}/>

                <div className="debugDisplay">
                  {settings.activeTool}
                  <button id="undo" disabled={undos.length===0}>Undo</button>
                  <button id="redo" disabled={redos.length===0}>Redo</button>

                  <button id="bom">Bom</button>
                </div>
              </div>  
            )
          }
          return elements
        }

        let jamInner = null
        jamInner = normalContent(settings, items, contextTaps, comments)

        if(!settings.webglEnabled){
          jamInner = renderWebglError()
        }

        return (
          <div className="jam" 
            onDragOver={interactions.subject('dragover').onEvent}
            onDrop={interactions.subject('drop').onEvent}>
              
              {jamInner}

              {loaderSpinner}
          </div>
        )
      }
    )
}


App = Cycle.component('App', App)

export default App