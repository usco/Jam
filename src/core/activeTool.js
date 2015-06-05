import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import {toggleNote$,toggleThicknessAnnot$,toggleDistanceAnnot$, toggleDiameterAnnot$, toggleAngleAnnot$} from '../actions/annotActions'
import {setActiveTool$,clearActiveTool$} from '../actions/appActions'

let activeToolHack = undefined

function toggleTool(toolName, activeTool){
  console.log("toolName",toolName,activeTool,activeToolHack)
  //let activeTool = activeToolHack
  let val = toolName
  activeTool = (activeTool === val ? undefined: val)

  activeToolHack = activeTool
  return activeTool 
}

function makeMods(intent, source){
    console.log("here")
    let activeTool2 = new Rx.BehaviorSubject(undefined)

    let notesT$ = toggleNote$
      .map(()=>"addNote")

    let thickT$ = toggleThicknessAnnot$
      .map(()=>"addThickess")

    let distT$ = toggleDistanceAnnot$
      .map(()=>"addDistance")

    let diamT$ = toggleDiameterAnnot$
      .map(()=>"addDiameter")

    let angleT$ = toggleAngleAnnot$ 
      .map(()=>"addAngle")

    /*setToTranslateMode$
      .map(()=>"translate")

    setToRotateMode$
      .map(()=>"rotate")

    setToScaleMode$
      .map(()=>"scale")*/

    let changes$ = merge(
      notesT$,
      thickT$,
      distT$,
      diamT$,
      angleT$,

      clearActiveTool$.map(()=>undefined)
    ).share()

    changes$.subscribe(function(val){
      console.log("HAHAH",val)
    })

    return changes$


    /*return Observable.combineLatest(
      changes$,
      activeTool2,
      toggleTool
    )//.subscribe(val=>activeTool.onNext(val))*/

}

function model(intent, source) {
  return makeMods(intent)
}

export default model