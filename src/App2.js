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

let pjson = require('../package.json')
let appMetadata$ = Rx.Observable.just({
  name: pjson.name,
  version:pjson.version 
})

  //interactions
  /*let inter = require('./core/intents.js')
  let intent = inter.Intent({
    objectsTransforms$ : glview.objectsTransform$,
    selectedMeshes$    : glview.selectedMeshes$,
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
function TestCompo(interactions,props){
  let vtree$= props.get("data")
    .map(function(data){
      console.log("data",data)
      return <div className="foo">
        <span> Testing </span>
        <button className="innerButton">clicky </button>
        <input type="checkbox" id="fooSetting" checked={data.valid}/> 
      </div>
      } 
    )
  return {
    view:vtree$,
    events:{
      mambo:Rx.Observable.timer(200, 100),
    }

  }
}

TestCompo = Cycle.component('TestCompo',TestCompo)


function intent(interactions){
  let glviewInit$ = interactions.get(".glview","initialized$")
  let singleTaps$ = interactions.get(".glview","singleTaps$")
  let doubleTaps$ = interactions.get(".glview","doubleTaps$")
  let contextTaps$ = interactions.get(".glview","contextTaps$")
  let selectTransforms$ = interactions.get(".glview","selectionsTransforms$")

  //let dnds$ = observableDragAndDrop('.glview', interactions)

  singleTaps$.pluck("detail").subscribe(event => console.log("singleTaps",event))
  doubleTaps$.pluck("detail").subscribe(event => console.log("doubleTaps",event))
  contextTaps$.pluck("detail").subscribe(event => console.log("contextTaps",event))
  selectTransforms$.pluck("detail").subscribe(event => console.log("selectTransforms",event))

  //dnds$.subscribe(event => console.log("dnds",event))  

  interactions.get(".jam","click")
    .subscribe( event => console.log("click"))


  /*interactions.get(".settingsView", "foo")
    .subscribe(settings => console.log("settings change",settings))

  interactions.get(".settingsView","bla$")
    .subscribe(settings => console.log("settingsView bla"))

  interactions.get(".settingsView .showGrid", "change")
    .subscribe(settings => console.log("showGrid bla")) */


  let clicky$ = interactions.get(".foo .innerButton","click").map(true).startWith(true)
    //.subscribe(settings => console.log("inner click"))

  let checky$ = interactions.get(".foo #fooSetting","change").map(event => event.target.checked).startWith(false)
    //.subscribe(settings => console.log("checkbox change"))


  let bla$ = Rx.Observable.combineLatest(
    clicky$,
    checky$,
    function(clicky,checky){
      return {
        valid:checky,
        stuff:"42"
      }

    }
  )

  //bla$.subscribe(data=>console.log("data",data))

  return bla$

  /*interactions.get(".foo","mambo")
    .subscribe(settings => console.log("inner mambo"))*/
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
  console.log("sources")
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

  meshSources$
    .subscribe(data => console.log("meshSources",data))
  return
}  

function doLotsOfThings(assetManager, kernel){

  //experimental 
  let res$ = meshSources$
    .flatMap(function(dataSource){
      let resource = assetManager.load( dataSource, {keepRawData:true, parsing:{useWorker:true,useBuffers:true} } )
      return Rx.Observable.fromPromise(resource.deferred.promise)
    })
    .shareReplay(1)

  //mesh + resource data together
  let combos$ =
    res$.map(function(resource){
      let mesh = postProcessMesh(resource)
      mesh=centerMesh(mesh)
      return {mesh, resource}
    })
    .shareReplay(1)

  //stream of processed meshes
  /*let meshes$ = res$
    .map( postProcessMesh )
    .map( centerMesh )

  //mesh + resource data together
  let combos$ = meshes$
    .zip(res$, function(mesh,resource){
      return {mesh,resource}
    })
    .shareReplay(1)*/
  
  //register meshes <=> types
  let partTypes$ = require('./core/partReg')
  partTypes$ = partTypes$({combos$:combos$})

  //register meshes <=> bom entries
  let bom$ = require('./core/bomReg')
  bom$ = bom$({
    addBomEntries$:addBomEntries$,
    combos$:combos$,
    partTypes$:partTypes$,
    entities$:entities$,
    selectBomEntries$:selectBomEntries$,
    selectBomEntries2$:selectBomEntries2$
  })

  bom$.subscribe(function(bom){
    updateBom(bom)
  })

  Array.prototype.flatMap = function(lambda) { 
    return Array.prototype.concat.apply([], this.map(lambda)) 
  }


  //this one takes care of adding templatemeshes
  combos$
    .zip(partTypes$.skip(1).map( x=>x.latest ),function(cb, typeUid){
      kernel.partRegistry.addTemplateMeshForPartType( cb.mesh.clone(), typeUid )
    })
    .subscribe(function(data){
      console.log("templatemeshes",data)
    })

  //we observe changes to partTypes to add new instances
  //note : this should only be the case if we have either
  //draged meshed, or got meshes from urls
  //OR we must use data from our entities "model"
  partTypes$
    .skip(1)
    .withLatestFrom(entities$,function(partTypes, entities){

      let idx = Object.keys(entities.byId).length
      let typeUid = partTypes.latest
      let name = partTypes.typeUidToMeshName[typeUid]+idx
      let bbox = partTypes.typeData[typeUid].bbox
      
      return {name, typeUid, bbox}
    })
    .subscribe(
      function(data){
      console.log("updated mesh registry, adding instance",data)

      //FIXME: hack "centerMesh" like method, as centerMesh centers a mesh that gets "discarded" in a way
      let h = data.bbox.max[2]  - data.bbox.min[2]

      let partInstance =
      {
          name: data.name,
          iuid: generateUUID(),
          typeUid: data.typeUid,
          color: "#07a9ff",
          pos: [
              0,
              0,
              h/2
          ],
          rot: [
              0,
              0,
              0
          ],
          sca: [
              1,
              1,
              1
          ],
          bbox:data.bbox
      }

      addEntityInstances$(partInstance)
    })
}




function App(interactions) {
  let activeTool = "translate"
  let items$ = Rx.Observable.just(
    [
      {
        name: "fff",
        iuid: "uuid",
        typeUid: "dfsdfsdf",
        color: "#07a9ff",
        pos: [
            0,
            0,
            0,
        ],
        rot: [
            0,
            0,
            0
        ],
        sca: [
            1,
            1,
            1
        ],
        bbox:undefined
      }
    ]
  )

  let dragOvers$ = interactions.subject("dragover")
  let drops$  = interactions.subject("drop")  
  let dndSources$ = observableDragAndDrop(dragOvers$, drops$)  
    //.subscribe(data => console.log("dndSources",data))
  let urlSources$ =null
  let sources$ = sources(urlSources$, dndSources$)

  let testCompoData$ = intent(interactions)

  let settings$ = settingsM(interactions)

  


  return Rx.Observable
    .combineLatest(
      appMetadata$,
      items$,
      settings$,
      testCompoData$,
      function(appMetadata, items, settings, testCompoData){

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
              className="glview"/>

            <SettingsView settings={settings} ></SettingsView>
            <FullScreenToggler/> 


            <TestCompo data={testCompoData}/>
          </div>
        )
      }
    )
}


App = Cycle.component('App', App)

export default App