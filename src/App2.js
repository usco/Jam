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

import {settingsIntent} from './core/settingsIntent'

//bom
import Bom from './core/bom/bom'
import {bomIntents} from './core/bom/intents'

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

  let settingsSources$ = urlSources.settings$

  let postMessages$ = require('./core/drivers/postMessageDriver')( )
  postMessages$.subscribe(e=>console.log("postMessageDriverMessage",e))
  
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

  let settings$ = settingsIntent(interactions)
    .merge(settingsSources$.filter(exists))//restore old data

  let {kernel, assetManager} = makeInternals()

  let meshResources$ = meshResources(meshSources$, assetManager)

  let intents = entityIntents(interactions)  

  //register meshes <=> types
  let partTypes = require('./core/partReg')
  let partTypes$ = partTypes({
    combos$:meshResources$
    ,deleteAllEntities$: intents.deleteAllEntities$
  })

  //get new instances from "types"
  let newInstFromTypes$ = entityInstanceFromPartTypes(partTypes$)
  let contextTaps$ = intents.contextTaps$

  //bom
  let bomIntent = bomIntents(interactions)
  bomIntent = {
    addBomEntries$:new Rx.Subject()
    ,removeEntries$:new Rx.Subject()//bomIntent.removeEntries$
    ,partTypes$
    ,combos$:meshResources$

  }
  let bom$ = Bom(bomIntent)

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

  let addEntities$ = newInstFromTypes$.merge(addAnnotation$)
  
  //entities
  let iIntent = {
    createEntityInstance$:new Rx.Subject(),//createEntityInstance$,
    addEntities$: addEntities$,

    updateEntities$: intents.selectionTransforms$,//
    deleteEntities$: intents.deleteEntities$,
    duplicateEntities$: intents.duplicateEntities$,  
    deleteAllEntities$: intents.deleteAllEntities$, 

    replaceAll$:intents.replaceAll$,
    settings$:settings$
  }
  let entities$ = entities(iIntent)

  let comments$ = comments(commentsIntents(interactions, settings$))
  comments$.subscribe(e=>console.log(e))

  //output (USE DRIVER!!!!)
  settings$.subscribe(function(settings){
    console.log("settings, to save etc",settings)
    localStorage.setItem("jam!-settings",JSON.stringify(settings) )
  })

  let {getVisual,addVisualProvider } = createVisualMapper(partTypes$, entities$)

  //selections 
  let selections$ = selections( reverseSelections(selectionsIntents(interactions),entities$) )

  //undo redo
  let _historyIntents = historyIntents(interactions)
  let history$ = new Rx.BehaviorSubject({
    undos:[],
    redos:[]
  })

  entities$
    //.pluck("instances")
    //.distinctUntilChanged()
    .withLatestFrom(history$,function(entities,history){
      //console.log("updating history")
      //history.undos.push(entities)
    })
    .subscribe(e=>e)


  Rx.Observable.merge(
    _historyIntents.undo$.map(true),
    _historyIntents.redo$.map(false)
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
        intents.replaceAll$.onNext(last)
      }

    })
    .subscribe(e=>e)

  
  /*let contextMenuItems = contextTaps$
    .combineLatest(
      entities$.pluck("selectedIds").filter(exists).filter(x=>x.length>0),
      function(taps,selectedIds){
          //HOW THE HELL DO I DO ANYTHING NOW ??
        return lookupByEntityCategory["annot"].concat(lookupByEntityCategory["common"])
      })
    //.subscribe(data=>console.log("contextMenuItems",data)) */
    
  return Rx.Observable
    .combineLatest(
      entities$,
      bom$,
      settings$,
      contextTaps$
      ,history$
      ,comments$
      ,selections$
      ,function(items, bom, settings, contextTaps, history, comments, selections){

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

        function appCriticalErrorDisplay(){
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
                <FullScreenToggler/> 
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

        let jamInner = normalContent(settings, items, contextTaps, comments)
        if(!settings.webglEnabled){
            jamInner = appCriticalErrorDisplay()
        }
        return (
          <div className="jam" 
            onDragOver={interactions.subject('dragover').onEvent}
            onDrop={interactions.subject('drop').onEvent}>
              {jamInner}
          </div>
        )
      }
    )
}


App = Cycle.component('App', App)

export default App