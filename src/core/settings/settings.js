import {Rx} from '@cycle/core'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge
import combineTemplate from 'rx.observable.combinetemplate'


/*
  FIELDNAMES: always the same ones
  
  PARAMS priority:
    DEFAULTS => LOADED => NEW
*/


///defaults, what else ?
const defaults = {
  webglEnabled:true,
  mode:"editor",
  autoSelectNewEntities:true,
  activeTool:undefined,
  repeatTool:false,

  //these are "domain specific", there should be a way for sub systems
  //to "hook up" to the main data storage
  camera:{
    autoRotate:false
  },
  grid:{
    show:true
  },
  annotations:{
    show:true
  }
}

//need to make sure source data structure is right 
function applyDefaults(data$){
  return data$.map(function(data){
    return Object.assign(defaults,data)
  })
}

    /*let output = {
      grid:{show:input.showGrid}
      ,annotations:{show:input.showAnnot}
      ,camera:{ autoRotate:input.autoRotate}

      ,mode:input.appMode
    }*/


function updateSettings(currentData,nData){
  console.log("currentData",currentData,nData)
  let output = Object.assign({},currentData,nData)
  return output
}

function modification(actions){  
  //actions.changeSetting$.subscribe(e=>console.log("changeSetting",e))
  function remapStructure(input){

    if(input.showGrid !==undefined ) return {grid:{show:input.showGrid}}
    if(input.showAnnot !==undefined ) return {annotations:{show:input.showAnnot}}
    if(input.autoRotate !==undefined ) return {camera:{autoRotate:input.autoRotate}}

    if(input.appMode !==undefined ) return {mode:input.appMode}

    return input
  }

  let _changeSetting$ = actions.changeSetting$
    .map(remapStructure)
    .map((newData) => (existingData) => {
      return updateSettings(existingData, newData)
    })

  return merge(
    _changeSetting$
  )
}


function settings(intent, source) {
  let source$ = source || Observable.just(defaults)
  source$ = applyDefaults(source)

  let modifications$ = modification(intent)

  return modifications$
    .merge(source$)
    .scan((entityData, modFn) => modFn(entityData))//combine existing data with new one
    .distinctUntilChanged()
    .shareReplay(1)
}

export default settings