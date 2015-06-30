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
import EntityInfos from './components/EntityInfos2'

import {observableDragAndDrop} from './interactions/dragAndDrop'

//temporary
import {makeInternals, meshResources, entityInstanceFromPartTypes} from './core/tbd0'
import {entityToVisuals, meshInjectPostProcess, applyEntityPropsToMesh} from './core/entityToVisuals'
import {exists} from './utils/obsUtils'
import {hasEntity,hasNoEntity,getEntity} from './utils/entityUtils'



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

function dataFromMesh (objTransform$){
  function toArray (vec){
    return vec.toArray().slice(0,3)
  }
  objTransform$ = objTransform$.filter(hasEntity)

  let eId = objTransform$.map(getEntity).pluck('iuid').startWith("-1")
    .distinctUntilChanged(null, itemsEqual)
  let pos = objTransform$.pluck('position').map(toArray).startWith([0,0,0])
    .distinctUntilChanged(null, itemsEqual)
  let rot = objTransform$.pluck('rotation').map(toArray).startWith([0,0,0])
    .distinctUntilChanged(null, itemsEqual)
  let sca = objTransform$.pluck('scale').map(toArray).startWith([1,1,1])
    .distinctUntilChanged(null, itemsEqual)

   
  return combineTemplate(
    {
      iuids: eId, 
      //entity,
      pos:pos,
      rot:rot,
      sca:sca
    })
} 

function dataFromMesh2(objTransform$){
  function toArray (vec){
    return vec.toArray().slice(0,3)
  }

  let foo$= objTransform$
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

  //foo$.subscribe(data => console.log("RAW objTransform",data))

  return foo$
}

function intent(interactions){
  let glviewInit$ = interactions.get(".glview","initialized$")
  let singleTaps$ = interactions.get(".glview","singleTaps$")
  let doubleTaps$ = interactions.get(".glview","doubleTaps$")
  let contextTaps$ = interactions.get(".glview","contextTaps$")

  /*singleTaps$.pluck("detail").subscribe(event => console.log("singleTaps",event))
  doubleTaps$.pluck("detail").subscribe(event => console.log("doubleTaps",event))
  contextTaps$.pluck("detail").subscribe(event => console.log("contextTaps",event))
  selectTransforms$.pluck("detail").subscribe(event => console.log("selectTransforms",event))*/
  
  let selectionTransforms$ = Rx.Observable.merge(
    //interactions.get(".glview","selectionsTransforms$").pluck("detail").filter(hasEntity)
    //  .map(function(m){ return {iuids:m.userData.entity.iuid, pos:m.position,rot:m.rot,sca:m.sca} })

    dataFromMesh2( interactions.get(".glview","selectionsTransforms$").pluck("detail") )
    ,interactions.get(".entityInfos","selectionTransforms$").pluck("detail")
  )

  let selections$ = interactions.get(".glview","selectedMeshes$")
    .pluck("detail")

  selections$ = Rx.Observable.merge(
    selections$.filter(hasEntity).map(getEntity).map(e=>e.iuid),
    selections$.filter(hasNoEntity).map([])
  )


  return {
    selections$,
    selectionTransforms$

  }
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

  let intents = intent(interactions)  
  //intents.selectionTransforms$
  //  .subscribe(data=>console.log("selectionTransforms",data.pos))


  let entities = require("./core/entityModel")

  intents = {
    createEntityInstance$:new Rx.Subject(),//createEntityInstance$,
    addEntities$: newInstFromTypes$,//addEntityInstances$,

    updateEntities$: intents.selectionTransforms$,//
    deleteEntities$: new Rx.Subject(), 
    duplicateEntities$: new Rx.Subject(),  
    deleteAllEntities$: new Rx.Subject(), 
    selectEntities$: intents.selections$,//new Rx.Subject(), 

    newDesign$: new Rx.Subject(), 
  }
  let entities$ = entities(intents)

  //entities$
  //  .subscribe(data=>console.log("mesh data",data))
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
  //entityToVisuals()

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

  let visualMappings$ = entities$
    .pluck("instances")
    .withLatestFrom(partTypes$,function(entries, types){

      //console.log("entries",entries,"types",types)

      return entries.map(function(entity){
        let mesh = types.typeUidToTemplateMesh[entity.typeUid].clone()
        
        mesh = meshInjectPostProcess(mesh)
        mesh = applyEntityPropsToMesh({entity,mesh})

        return mesh
      })

    })
    /*.flatMap(function(items){
      return Rx.Observable.from(items)
    })*/
    //.filter(x=> types.indexOf(x.type) > -1 )
  

  return Rx.Observable
    .combineLatest(
      appMetadata$,
      entities$,
      settings$,
      visualMappings$,
      function(appMetadata, items, settings, visualMappings){

        //console.log("items",items, items.instances)

        let selections = items.selectedIds.map( id=>items.byId[id] )

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
              visualMappings={visualMappings}
              className="glview"/>


            <SettingsView settings={settings} ></SettingsView>
            <FullScreenToggler/> 
            <EntityInfos entities={selections} settings={settings} />

          </div>
        )
      }
    )
}


App = Cycle.component('App', App)

export default App