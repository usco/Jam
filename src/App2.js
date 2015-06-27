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
            <GlView activeTool={activeTool} className="glview" /> 
    */



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
          <div className="jam">
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