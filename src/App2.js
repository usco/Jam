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
import {addAnnotationMod} from './core/annotations'

//temporary
import {makeInternals, meshResources, entityInstanceFromPartTypes} from './core/tbd0'
import {getVisual,createVisualMapper} from './core/entitiesToVisuals'

import {exists} from './utils/obsUtils'
import {hasEntity,hasNoEntity,getEntity} from './utils/entityUtils'
import {getXY} from './utils/uiUtils'
import {first,toggleCursor} from './utils/otherUtils'

//NEEDED because of circular dependency ...
import {clearActiveTool$} from './actions/appActions'


let pjson = require('../package.json')
let appMetadata$ = Rx.Observable.just({
  name: pjson.name,
  version:pjson.version 
})

 
function dataFromMesh(objTransform$){
  function toArray (vec){
    return vec.toArray().slice(0,3)
  }

  return objTransform$
    .filter(hasEntity)
    .map(
      function(m){ 
        return {
          iuids:m.userData.entity.iuid, 
          pos:toArray(m.position),
          rot:toArray(m.rotation),
          sca:toArray(m.scale)
        } 
    })
    .shareReplay(1)
}

function extractEntities(data){
  return data.filter(hasEntity).map(getEntity).map(e=>e.iuid)
}

function intent(interactions){
  let glviewInit$ = interactions.get(".glview","initialized$")
  let shortSingleTaps$ = interactions.get(".glview","shortSingleTaps$")
  let shortDoubleTaps$ = interactions.get(".glview","shortDoubleTaps$")
  let contextTaps$ = interactions.get(".glview","longTaps$").pluck("detail")
    .map(function(e){
      if(!e) return undefined
      return getXY(e)
    }).startWith(undefined)

  let selectionTransforms$ = Rx.Observable.merge(
    //interactions.get(".glview","selectionsTransforms$").pluck("detail").filter(hasEntity)
    //  .map(function(m){ return {iuids:m.userData.entity.iuid, pos:m.position,rot:m.rot,sca:m.sca} })
    dataFromMesh( interactions.get(".glview","selectionsTransforms$").pluck("detail") )
    ,interactions.get(".entityInfos","selectionTransforms$").pluck("detail")
  )

  let selections$ = interactions.get(".glview","selectedMeshes$")
    .pluck("detail")
    .map(extractEntities)

  let contextMenuActions$ = interactions.get(".contextMenu", "actionSelected$").pluck("detail")
  let deleteEntities$     = contextMenuActions$.filter(e=>e.action === "delete").pluck("selections")
  let deleteAllEntities$  = contextMenuActions$.filter(e=>e.action === "deleteAll").pluck("selections")
  let duplicateEntities$  = contextMenuActions$.filter(e=>e.action === "duplicate").pluck("selections")

  //we need to "shut down the context menu after any click inside of it"
  contextTaps$ = contextTaps$.merge(
    contextMenuActions$.map(undefined)
  )

  //get any "clear" message from post message
  let postMessages$ = require('./core/postMessageDriver')( )
  let newDesign$ = postMessages$.filter(hasClear).map(true)

  return {
    selections$
    ,selectionTransforms$

    ,contextTaps$

    ,deleteEntities$
    ,deleteAllEntities$
    ,duplicateEntities$

    ,newDesign$

    /*addNote$,
    measureDistance$,
    measureThickness$,
    measureAngle$*/
  }
}

function annotIntents(interactions){
  let shortSingleTaps$ = interactions.get(".glview","shortSingleTaps$")
  //shortSingleTaps$.pluck("detail").subscribe(e=>console.log("FUUU",e.detail.pickingInfos[0].object.userData))

  let annotationCreationStep$ = shortSingleTaps$.pluck("detail")
    .map( (event)=>event.detail.pickingInfos)
    .filter( (pickingInfos)=>pickingInfos.length>0)
    .map(first)
    .share()  

  return {
    creationStep$ : annotationCreationStep$
  }
}


function hasModelUrl(data){
  if(data && data.hasOwnProperty("modelUrl")) return true
    return false
}
function hasDesignUrl(data){
  if(data && data.hasOwnProperty("designUrl")) return true
    return false
}
function hasClear(data){
  if(data && data.hasOwnProperty("clear")) return true
    return false
}

function sources(urlSources$, dndSources$){
  //data sources (drivers)
  let dataSources = require('./core/sources/dataSources').getDataSources
  let urlSources = require('./core/sources/urlSources')

  let {meshSources$, designSources$} = dataSources(dndSources$, urlSources)

  let settingsSources$ = urlSources.settings$

  let postMessages$ = require('./core/postMessageDriver')( )
  postMessages$.subscribe(e=>console.log("postMessageDriverMessage",e))
  
  meshSources$   =  meshSources$.merge( postMessages$.filter(hasModelUrl).pluck("modelUrl") )
  //designSources$ =  designSources$.merge( postMessages$.filter(hasDesignUrl).pluck("designUrl") )

  return {meshSources$, designSources$, settingsSources$}
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

  let intents = intent(interactions)  

  //register meshes <=> types
  let partTypes = require('./core/partReg')
  let partTypes$ = partTypes({
    combos$:meshResources$
    ,newDesign$: intents.newDesign$
  })
  //partTypes$.subscribe(e=>console.log("fooType",e))

  //get new instances from "types"
  let newInstFromTypes$ = entityInstanceFromPartTypes(partTypes$)
  let contextTaps$ = intents.contextTaps$

  //annotations
  let aIntents = annotIntents(interactions)
  intent = {
    creationStep$:aIntents.creationStep$,
    settings$:settings$
  }
  let addAnnotation$ = addAnnotationMod(intent)

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
  intent = {
    createEntityInstance$:new Rx.Subject(),//createEntityInstance$,
    addEntities$: addEntities$,

    updateEntities$: intents.selectionTransforms$,//
    deleteEntities$: intents.deleteEntities$,
    duplicateEntities$: intents.duplicateEntities$,  
    deleteAllEntities$: intents.deleteAllEntities$, 
    selectEntities$: intents.selections$,

    newDesign$: intents.newDesign$, 
    settings$:settings$
  }

  let entities = require("./core/entities")
  let entities$ = entities(intent)


  //output (USE DRIVER!!!!)
  settings$.subscribe(function(settings){
    console.log("settings, to save etc",settings)
    localStorage.setItem("jam!-settings",JSON.stringify(settings) )
  })


  //what is my visual for any given entity
  let otherData$ = partTypes$
    .zip(meshResources$,function(types, meshResource){

      console.log("types",types,"meshResource",meshResource)
      return {
        typeUid:types.meshNameToPartTypeUId[meshResource.resource.name],
        mesh:meshResource.mesh,
        resource:meshResource.resource
      }
    })
    /*.scan(function(acc,val){
      console.lot("acc",acc,"val",val)
      return acc[val.typeUid] = val.mesh
    },{})*/
  .subscribe(data=>console.log(" data",data))

  let {getVisual,addVisualProvider } = createVisualMapper(partTypes$, entities$)

  //Experimental: system describing available actions by entity "category"
  let lookupByEntityCategory ={
    "common":[
      "delete",
      "deleteAll",
      "duplicate"
    ],
    "part": [   
    ],
    "annot":[
      "add note",
      "measure thickness",
      "measure Diameter",
      "measure Distance"
    ]
  }

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
      appMetadata$,
      entities$,
      settings$,
      contextTaps$,
      function(appMetadata, items, settings, contextTaps){
        //            
        let contextMenuItems = [
          {text:"Duplicate", action:"duplicate"},
          {text:"Delete",action:"delete"},
          {text:"DeleteAll",action:"deleteAll"},

           {text:"transforms",items:[
            {text:"translate", action:"translate"},
            {text:"rotate",action:"rotate"},
            {text:"scale",action:"scale"}
          ]},
          {text:"annotations",items:[
            {text:"Add note", action:"addNote"},
            {text:"Measure thickness",action:"measureThickness"},
            {text:"Measure Diameter",action:"measureDiameter"},
            {text:"Measure Distance",action:"measureDistance"},
            {text:"Measure Angle",action:"measureAngle"}
          ]}
        ]

        function createContextmenuItems(){
        }
        
        //contextTaps = undefined
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
        
        function normalContent(settings, items,contextTaps){
          let selections = items.selectedIds.map( id=>items.byId[id] )
          //console.log("selections",selections,"items",items,"annotations",annotations)
          let _items = items.instances

          let elements = (
            <div>
              <GlView 
              settings={settings}
              items={_items} 
              selections={selections}
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
                selections={selections}
                visualMappings={getVisual}
                className="glview"/>
                
                <SettingsView settings={settings} ></SettingsView>

                <ContextMenu position={contextTaps} items={contextMenuItems} selections={selections}/>
                <FullScreenToggler/> 
                <EntityInfos entities={selections} settings={settings} />

                <div className="debugDisplay">
                  {settings.activeTool}
                </div>
              </div>  
            )
          }
          return elements
        }

        let jamInner = normalContent(settings, items, contextTaps)
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