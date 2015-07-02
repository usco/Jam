import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from 'log-minim'
let log = logger("app")
log.setLevel("error")

import {toggleNote$,toggleThicknessAnnot$,toggleDistanceAnnot$, toggleDiameterAnnot$, toggleAngleAnnot$} from '../actions/annotActions'
import {setActiveTool$,clearActiveTool$} from '../actions/appActions'
import {setToTranslateMode$, setToRotateMode$, setToScaleMode$} from '../actions/transformActions'
import {getPropertyByPath,setPropertyByPath} from '../utils/otherUtils'

//all of these are purely ui side/ visuals related ???
const defaults = {//TODO: each component should "register its settings"
  activeMode: true,//if not, disable 3d view ,replace with some static content

  activeTool:undefined,
  lastDesignUri:undefined,

  mode:"editor",//viewer, editor or ???,
  camActive:false,
  fullscreen:false,

  camera:{
    autorotate:false,
  },

  annotations:{
    show:true,
  },
  grid:{
    show:true,
    size:""
  },
  bom:{
    show:false,//this belongs in the bom system
  }
}

function toggleTool(toolName, activeTool){
  let val = toolName
  activeTool = (activeTool === val ? undefined: val)

  return activeTool 
}

function makeModifications(intent){
    let activeTool$ = intent.tool$ 
      .map((data) => (appData) => {

        let activeTool = appData.activeTool
        activeTool = toggleTool(data,activeTool)
        appData.activeTool = activeTool
        return appData
    })


    let setSetting$ = intent.setSetting$
      .map((data) => (appData) => {
        //log.info("updating app",appData,"with",data)

        let {path,value} = data
        //FIXME:should be more immutable friendly
        let curValue = getPropertyByPath(appData,path)

        setPropertyByPath(appData,path,value)
        return appData
    })

    /*let lastDesignUri$ = intent.tool$
      .map((data) => (activeTool) => {
        
        return "activeTool"
    })*/
    return merge(
      activeTool$,
      setSetting$
    )
}

function model(intent, source) {
  let source$ = source || Observable.just(defaults)

  //hack
  intent.tool$ = 
    merge(
      toggleNote$.map(()=>"addNote"),
      toggleThicknessAnnot$.map(()=>"addThickess"),
      toggleDistanceAnnot$.map(()=>"addDistance"),
      toggleDiameterAnnot$.map(()=>"addDiameter"),
      toggleAngleAnnot$.map(()=>"addAngle"),

      setToTranslateMode$.map(()=>"translate"),
      setToRotateMode$.map(()=>"rotate"),
      setToScaleMode$.map(()=>"scale"),

      clearActiveTool$.map(()=>undefined)
    )
  
  
  let modification$ = makeModifications(intent)

  return modification$
    .merge(source$)
    .scan((appData, modFn) => modFn(appData))//combine existing data with new one
    .startWith(defaults)
    .shareReplay(1)

}

export default model