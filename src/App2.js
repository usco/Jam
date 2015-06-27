require("./app.css")

let Cycle = require('cycle-react')
let React = require('react')
let Rx = Cycle.Rx

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


function intent(interactions){
  let glviewInit$ = interactions.get(".glview","initialized$")
  let singleTaps$ = interactions.get(".glview","singleTaps$")
  let doubleTaps$ = interactions.get(".glview","doubleTaps$")
  let contextTaps$ = interactions.get(".glview","contextTaps$")
  let selectTransforms$ = interactions.get(".glview","selectionsTransforms$")

  let dnds$ = observableDragAndDrop('.glview', interactions)

  singleTaps$.pluck("detail").subscribe(event => console.log("singleTaps",event))
  doubleTaps$.pluck("detail").subscribe(event => console.log("doubleTaps",event))
  contextTaps$.pluck("detail").subscribe(event => console.log("contextTaps",event))
  selectTransforms$.pluck("detail").subscribe(event => console.log("selectTransforms",event))

  dnds$.subscribe(event => console.log("dnds",event))  

  interactions.get(".jam","click")
    .subscribe( event => console.log("click"))
}


function _App(interactions) {
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

  intent(interactions)

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
            <GlView activeTool={activeTool} className="glview" /> 


    */



  return Rx.Observable
    .combineLatest(
      appMetadata$,
      items$,

      function(appMetadata, items){

        let settings = {}
        return (
          <div className="jam">
            <div>{appMetadata.name}{appMetadata.version}</div>
            <GlView activeTool={activeTool} items={items} className="glview"/>

            <SettingsView settings={settings}></SettingsView>
            <FullScreenToggler/> 
          </div>
        )
      }
    )
}


let App = Cycle.component('App', _App)

export default App