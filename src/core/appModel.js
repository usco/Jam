import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import {toggleNote$,toggleThicknessAnnot$,toggleDistanceAnnot$, toggleDiameterAnnot$, toggleAngleAnnot$} from '../actions/annotActions'
import {setActiveTool$,clearActiveTool$} from '../actions/appActions'


function toggleTool(toolName, activeTool){
  console.log("toolName",toolName,activeTool)
  let val = toolName
  activeTool = (activeTool === val ? undefined: val)

  return activeTool 
}

function makeModifications(intent){

    let activeTool$ = intent.tool$ 
      .map((data) => (activeTool) => {
        let activeTool = toggleTool(data,activeTool)
        return activeTool
    })
    /*setToTranslateMode$
      .map(()=>"translate")

    setToRotateMode$
      .map(()=>"rotate")

    setToScaleMode$
      .map(()=>"scale")*/

    return merge(
      activeTool$
    )
}

function model(intent, source) {
  let source$ = Observable.just(undefined)

  //hack
  intent.tool$ = 
    merge(
      toggleNote$.map(()=>"addNote"),
      toggleThicknessAnnot$.map(()=>"addThickess"),
      toggleDistanceAnnot$.map(()=>"addDistance"),
      toggleDiameterAnnot$.map(()=>"addDiameter"),
      toggleAngleAnnot$.map(()=>"addAngle"),
      clearActiveTool$.map(()=>undefined)
    )
  
  /*intent.design$
    _lastProjectUri: undefined,
  _lastProjectName: undefined,*/
  
  let modification$ = makeModifications(intent)

  return modification$
    .merge(source$)
    .scan((activeTool, modFn) => modFn(activeTool))//combine existing data with new one
    .shareReplay(1)

}

export default model