require("./app.css")

let Cycle = require('cycle-react')
let React = require('react')
import Rx from 'rx'
import combineTemplate from 'rx.observable.combinetemplate'


import GlView from './components/webgl/GlView'
import BomView from './components/Bom/BomView'
import SettingsView from './components/SettingsView'
import FullScreenToggler from './components/FullScreenToggler'
import ContextMenu2 from './components/ContextMenu2'

import {observableDragAndDrop} from './interactions/dragAndDrop'

//temporary
import {makeInternals, meshResources, entityInstanceFromPartTypes} from './core/tbd0'
import {entityToVisuals} from './core/entityToVisuals'


let pjson = require('../package.json')
let appMetadata$ = Rx.Observable.just({
  name: pjson.name,
  version:pjson.version 
})

  //interactions
  /*let inter = require('./core/intents.js')
  let intent = inter.Intent({
    objectsTransforms$ : glview.objectsTransform$,
    selectedMeshes$    : glview.selectedMeshes$,²
    selectedBomEntries$: selectBomEntries$,
    selectEntities$,

    //these indicate an issue, they should not need to be injected into an intent
    appState$: appState$,
    entities$:entities$,
    bom$:bom$,
  })

  intent.entityTransforms$
    .subscribe(updateEntities$)

  intent.entitiesToSelect$
    .subscribe( selectEntities$ )

  intent.bomEntriesToSelect$
    .subscribe( selectBomEntries2$ )
    */



function intent(interactions){
  let glviewInit$ = interactions.get(".glview","initialized$")
  let singleTaps$ = interactions.get(".glview","singleTaps$")
  let doubleTaps$ = interactions.get(".glview","doubleTaps$")
  let contextTaps$ = interactions.get(".glview","contextTaps$")
  let selectTransforms$ = interactions.get(".glview","selectionsTransforms$")

  singleTaps$.pluck("detail").subscribe(event => console.log("singleTaps",event))
  doubleTaps$.pluck("detail").subscribe(event => console.log("doubleTaps",event))
  contextTaps$.pluck("detail").subscribe(event => console.log("contextTaps",event))
  selectTransforms$.pluck("detail").subscribe(event => console.log("selectTransforms",event))


}

function settingsM(interactions){
  let showGrid$   = interactions.get(".settingsView .showGrid", "change").map(event => event.target.checked).startWith(false)
  let showAnnot$  = interactions.get(".settingsView .showAnnot", "change").map(event => event.target.checked).startWith(false)
  let autoRotate$ = interactions.get(".settingsView .autoRotate", "change").map(event => event.target.checked).startWith(false)

  /*function foobar(fieldName){
    return interactions.get(".settingsView "+fieldName, "change").map(event => event.target.checked).startWith(false)
  }
  let fieldNames = [".showGrid",".showAnnot",".autoRotate"]
  fieldNames.map(foobar)*/

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

  //bla$.subscribe(bla=>console.log("lkjfdsfsfsd",bla))*/
  //return bla$
  return Rx.Observable.combineLatest(
    showGrid$,
    autoRotate$,
    function(showGrid$,autoRotate$, showAnnot$){
      return (
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

    /*updateDesign$({
      _persistent:_settings.persistent,
      uri:_settings.lastDesignUri,
      name:_settings.lastDesignName
    })*/
  })

  let {meshSources$, designSources$} = dataSources(dndSources$, urlSources)

  let settingsSources$ = urlSources.settings$

  meshSources$
    .subscribe(data => console.log("meshSources",data))

  return {meshSources$, designSources$, settingsSources$}
}  




function App(interactions) {
  let activeTool = "translate"

  let dragOvers$ = interactions.subject("dragover")
  let drops$  = interactions.subject("drop")  
  let dndSources$ = observableDragAndDrop(dragOvers$, drops$)  
    //.subscribe(data => console.log("dndSources",data))
  let urlSources$ =null
  let {meshSources$, designSources$, settingsSources$} = sources(urlSources$, dndSources$)

  let settings$ = settingsM(interactions)

  let {kernel, assetManager} = makeInternals()

  let meshResources$ = meshResources(meshSources$, assetManager)
    //.subscribe(data=>console.log("mesh data",data))
  //doLotsOfThings(kernel,assetManager,meshSources$)

  //register meshes <=> types
  let partTypes = require('./core/partReg')
  let partTypes$ = partTypes({combos$:meshResources$})

  //get new instances from "types"
  let newInstFromTypes$ = entityInstanceFromPartTypes(partTypes$)
    //.subscribe(data=>console.log("mesh data",data))
  

  let entities = require("./core/entityModel")

  let intent = {
    createEntityInstance$:new Rx.Subject(),//createEntityInstance$,
    addEntities$: newInstFromTypes$,//addEntityInstances$,

    updateEntities$: new Rx.Subject(), 
    deleteEntities$: new Rx.Subject(), 
    duplicateEntities$: new Rx.Subject(),  
    deleteAllEntities$: new Rx.Subject(), 
    selectEntities$: new Rx.Subject(), 

    newDesign$: new Rx.Subject(), 
  }
  let entities$ = entities(intent)

  //entities$
  //  .subscribe(data=>console.log("mesh data",data))
  //what is my visual for any given entity

  /*let otherData$ = partTypes$
    .zip(meshResources$,function(types, meshResource){

      console.log("types",types,"meshResource",meshResource)


      return {
        typeUid:types.meshNameToPartTypeUId[meshResource.resource.name],
        mesh:meshResource.mesh,
        resource:meshResource.resource
      }
    })
  .subscribe(data=>console.log(" data",data))*/
  entityToVisuals()

  /*let entitiesToMeshInstancesMap = new WeakMap()
  let meshInstancesToEntitiesMap = new WeakMap()//reverse map

  function entityVisual(entity){
  }

  entities$
  .skip(1)
  .combineLatest(partTypes$,
    function(entities,partTypes){

    }
  )
  .subscribe(data=>console.log(" data",data))
  */

  

  /*.flatMap(function(data){
    return Rx.Observable.from( kernel.getPartMeshInstance( data[0] ) )
  })
  .map(Rx.Observable.from)
  .subscribe(function(data){
    console.log("mesh data",data)
    //let foo$ = Rx.Observable.from( kernel.getPartMeshInstance(data.instances[0]) )
  })*/


  //let requestVisualForEntity$ = new Rx.Observable()
  let visualMappings$ = Rx.Observable.just()
  

  return Rx.Observable
    .combineLatest(
      appMetadata$,
      entities$,
      settings$,
      visualMappings$,
      function(appMetadata, items, settings,visualMappings){

        //console.log("settings",settings)
        return (
          <div className="jam" 
            onDragOver={interactions.subject('dragover').onEvent}
            onDrop={interactions.subject('drop').onEvent}
          >
            <div>{appMetadata.name}{appMetadata.version}</div>
            <GlView 
              activeTool={activeTool} 
              settings={settings}
              items={items} 
              mappings={visualMappings}
              className="glview"/>

            <SettingsView settings={settings} ></SettingsView>
            <FullScreenToggler/> 

          </div>
        )
      }
    )
}


App = Cycle.component('App', App)

export default App