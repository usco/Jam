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

//temporary
import {makeInternals, meshResources, entityInstanceFromPartTypes} from './core/tbd0'
import {entityToVisuals, meshInjectPostProcess, applyEntityPropsToMesh} from './core/entityToVisuals'
import {getVisual,createVisualMapper} from './core/entitiesToVisuals'



import {exists} from './utils/obsUtils'
import {hasEntity,hasNoEntity,getEntity} from './utils/entityUtils'
import {getXY} from './utils/uiUtils'

import {first,toggleCursor} from './utils/otherUtils'



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

  selections$ = Rx.Observable.merge(
    selections$.filter(hasEntity).map(getEntity).map(e=>e.iuid),
    selections$.filter(hasNoEntity).map([])
  )

  let contextMenuActions$ = interactions.get(".contextMenu", "actionSelected$").pluck("detail")
  let deleteEntities$     = contextMenuActions$.filter(e=>e.action === "delete").pluck("selections")
  let deleteAllEntities$  = contextMenuActions$.filter(e=>e.action === "deleteAll").pluck("selections")
  let duplicateEntities$  = contextMenuActions$.filter(e=>e.action === "duplicate").pluck("selections")


  //we need to "shut down the context menu after any click inside of it"
  contextTaps$ = contextTaps$.merge(
    contextMenuActions$.map(undefined)
  )

  return {
    selections$,
    selectionTransforms$,

    contextTaps$,

    deleteEntities$,
    deleteAllEntities$,
    duplicateEntities$,

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

function settingsM(interactions){
  //hack for firefox only as it does not correct get the "checked" value : note : this is not an issue in cycle.js
  let is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  function checked(event){
    if(is_firefox) return ! event.target.checked
      return event.target.checked
  }

  /*let showGrid$   = interactions.get(".settingsView .showGrid", "change").map(event => event.target.checked).startWith(false)
  let showAnnot$  = interactions.get(".settingsView .showAnnot", "change").map(event => event.target.checked).startWith(false)
  let autoRotate$ = interactions.get(".settingsView .autoRotate", "change").map(event => event.target.checked).startWith(false)*/
  let showGrid$   = interactions.get(".settingsView .showGrid", "change").map(checked).startWith(false)
  let showAnnot$  = interactions.get(".settingsView .showAnnot", "change").map(checked).startWith(false)
  let autoRotate$ = interactions.get(".settingsView .autoRotate", "change").map(checked).startWith(false)

  //for annotations, should this be here ?
  //heavy code smell  too
  let contextMenuActions$ = interactions.get(".contextMenu", "actionSelected$").pluck("detail")
  let activeTool$       = Rx.Observable.merge(
    contextMenuActions$.filter(e=>e.action === "addNote").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "measureDistance").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "measureThickness").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "measureAngle").pluck("action"),

    contextMenuActions$.filter(e=>e.action === "translate").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "rotate").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "scale").pluck("action")
  ).startWith(undefined)

  /*let bla$= combineTemplate(
    {
      camera:{
        autoRotate:autoRotate$
      },
      grid:{
        show:showGrid$
      },
      annotations:{
        show:showAnnot$
      }
    }
  )
  */
  let webglEnabled$          = Rx.Observable.just(true)
  let appMode$               = Rx.Observable.just("editor")
  let autoSelectNewEntities$ = Rx.Observable.just(true) //TODO: make settable
  

  return Rx.Observable.combineLatest(
    showGrid$,
    autoRotate$,
    showAnnot$,
    autoSelectNewEntities$,
    webglEnabled$,
    appMode$,
    activeTool$,
    function(showGrid, autoRotate, showAnnot, autoSelectNewEntities, webglEnabled, appMode, activeTool){
      return (
        {
          webglEnabled:webglEnabled,
          mode:appMode,
          autoSelectNewEntities:autoSelectNewEntities,
          activeTool:activeTool,

          camera:{
            autoRotate:autoRotate
          },
          grid:{
            show:showGrid
          },
          annotations:{
            show:showAnnot
          }
         
        }
      )
    }
  )
}


function sources(urlSources$, dndSources$){
  //data sources
  let dataSources = require('./core/sources/dataSources').getDataSources
  let urlSources = require('./core/sources/urlSources')

  //urlSources.appMode$.subscribe( appMode => setSetting$({path:"mode",value:appMode}) )
  urlSources.settings$.subscribe(function(settings){
    console.log("settings from old",settings)
    const defaults = {
      persistent:false,
      lastDesignUri:undefined,
      lastDesignName:undefined,

      /*grid:{
        show:false,
      },
      annotations{
        show:false
      }*/
    }
    let _settings = Object.assign({},defaults,settings)
  })

  let {meshSources$, designSources$} = dataSources(dndSources$, urlSources)

  let settingsSources$ = urlSources.settings$

  return {meshSources$, designSources$, settingsSources$}
}  


function App(interactions) {
  let meshFoo = new Rx.Subject()

  /*class Entity(){

    constructor(){

      this.incompleteBuffer = []
    }
  }*/

  meshFoo.subscribe(
    x=>console.log("step in streaming mesh")
    ,e=>e
    ,f=>console.log("done"))

  meshFoo.onNext("some mesh data")
  meshFoo.onCompleted("some mesh is done")
  ////////


  let dragOvers$  = interactions.subject("dragover")
  let drops$      = interactions.subject("drop")  
  let dndSources$ = observableDragAndDrop(dragOvers$, drops$)  
  let urlSources$ =null

  let {meshSources$, designSources$, settingsSources$} = sources(urlSources$, dndSources$)

  let settings$ = settingsM(interactions)

  let {kernel, assetManager} = makeInternals()

  let meshResources$ = meshResources(meshSources$, assetManager)

  //register meshes <=> types
  let partTypes = require('./core/partReg')
  let partTypes$ = partTypes({combos$:meshResources$})

  //get new instances from "types"
  let newInstFromTypes$ = entityInstanceFromPartTypes(partTypes$)
  let intents = intent(interactions)  
  let contextTaps$ = intents.contextTaps$

  //entities
  intent = {
    createEntityInstance$:new Rx.Subject(),//createEntityInstance$,
    addEntities$: newInstFromTypes$,//addEntityInstances$,

    updateEntities$: intents.selectionTransforms$,//
    deleteEntities$: intents.deleteEntities$,
    duplicateEntities$: intents.duplicateEntities$,  
    deleteAllEntities$: intents.deleteAllEntities$, 
    selectEntities$: intents.selections$,

    newDesign$: new Rx.Subject(), 
    settings$:settings$
  }

  let entities = require("./core/entities")
  let entities$ = entities(intent)

  //annotations
  let aIntents = annotIntents(interactions)
  intent = {
    addAnnotations$: new Rx.Subject(), 

    deleteAnnots$: intents.deleteEntities$,
    duplicateEntities$: intents.duplicateEntities$,  
    deleteAllEntities$: intents.deleteAllEntities$, 
    selectEntities$: intents.selections$,

    creationStep$:aIntents.creationStep$,
    settings$:settings$
  }
  let annotations = require("./core/annotations")
  let annotations$ = annotations(intent)


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

  let visualMappings$ = entities$
    .pluck("instances")
    .withLatestFrom(partTypes$,function(entries, types){

      return entries.map(function(entity){
        let mesh = types.typeUidToTemplateMesh[entity.typeUid].clone()
        
        mesh = meshInjectPostProcess(mesh)
        mesh = applyEntityPropsToMesh({entity,mesh})

        return mesh
      })
    })



  //test
  /*entities$
    .pluck("instances")*/

  let getVisual2 = createVisualMapper(partTypes$)

  Rx.Observable.from([
    {typeUid:"A0",iuid:5,name:"PART1",pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]},
    {typeUid:"A0",iuid:2,name:"PART2",pos:[0,0,40],rot:[0,45,0],sca:[1,1,1]},
    {typeUid:"A0",iuid:7,name:"PART3",pos:[10,-20,0],rot:[0,0,0],sca:[1,1,1]},
    
    //{typeUid:"A1",iuid:10,name:"ANNOT3",deps:[5,2,7],pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]},

    {typeUid:"A1",iuid:11,name:"Note ANNOT",value:"some text",
      pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
      target:{point:[10,5,0],iuid:2}
    },
    {typeUid:"A2",iuid:12,name:"thickness ANNOT",value:150.45,
      pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
      target:{entryPoint:[10,5,0], exitPoint:[0,-7.2,19],iuid:5}
    },
    {typeUid:"A3",iuid:13,name:"Diameter ANNOT",value:34.09,
      pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
      target:{point:[10,5,0],normal:[1,0,0],iuid:7}
    },
    {typeUid:"A4",iuid:14,name:"distance ANNOT",value:56.22,
      pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
      target:{
        start:{point:[10,5,0],iuid:2}, 
        end:{point:[0,-7.2,19],iuid:5}
      }
    }
  ])
    .map(getVisual2)
    .subscribe(function(vO){

      vO.subscribe(v2=>console.log("visuals",v2),e=>e,v3=>console.log("visuals done",v3))
    })

  /*visualMappings$ = visualMappings$.merge(
    entities
  )*/
  annotations$.subscribe(e=>console.log("annotations",e))


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

  let contextMenuItems = contextTaps$
    .combineLatest(
      entities$.pluck("selectedIds").filter(exists).filter(x=>x.length>0),
      function(taps,selectedIds){
        /*selectedIds.map(function(id){
          //HOW THE HELL DO I DO ANYTHING NOW ??
        })*/
        return lookupByEntityCategory["annot"].concat(lookupByEntityCategory["common"])
      })
    //.subscribe(data=>console.log("contextMenuItems",data))
  
  
  return Rx.Observable
    .combineLatest(
      appMetadata$,
      entities$,
      settings$,
      visualMappings$,
      contextTaps$,
      function(appMetadata, items, settings, visualMappings, contextTaps){

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
            {text:"Measure Angle"}
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
        
        function normalContent(settings,items, visualMappings,contextTaps){
          let selections = items.selectedIds.map( id=>items.byId[id] )
          let elements = (
            <div>
              <GlView 
              settings={settings}
              items={items} 
              selections={selections}
              visualMappings={visualMappings}
              className="glview"/>

              <SettingsView settings={settings} ></SettingsView>
            </div>
          )

          if(settings.mode === "editor"){
            elements =(
              <div>
                <GlView 
                settings={settings}
                items={items} 
                selections={selections}
                visualMappings={visualMappings}
                className="glview"/>
                
                <SettingsView settings={settings} ></SettingsView>

                <MainToolbar />
                <FullScreenToggler/> 
                <EntityInfos entities={selections} settings={settings} />
                <ContextMenu position={contextTaps} items={contextMenuItems} selections={selections}/>
              </div>  
            )
          }
          return elements
        }

        let jamInner = normalContent(settings,items, visualMappings, contextTaps)
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