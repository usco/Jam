import Rx from 'rx'
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

function modification(actions){  
  //actions.changeSetting$.subscribe(e=>console.log("changeSetting",e))

  function remapStructure(input){

    if(input.showGrid !==undefined ) return {grid:{show:input.showGrid}}
    if(input.showAnnot !==undefined ) return {annotations:{show:input.showAnnot}}
    if(input.autoRotate !==undefined ) return {camera:{autoRotate:input.autoRotate}}

    if(input.appMode !==undefined ) return {mode:input.appMode}

    /*let output = {
      grid:{show:input.showGrid}
      ,annotations:{show:input.showAnnot}
      ,camera:{ autoRotate:input.autoRotate}

      ,mode:input.appMode
    }*/
    return input
  }

  let changeSetting$ = actions.changeSetting$
    .map(remapStructure)
    .map((settingData) => (currentData) => {
     
      //console.log("settingData",settingData)
      let output = Object.assign({},currentData,settingData)

      return output
      //return currentData
    })

  return Observable.merge(
    changeSetting$
    ) 
}



function settings(intent, source) {
  let source$ = source || Observable.just(defaults)
  source$ = applyDefaults(source)

  let modifications$ = modification(intent)//modification(intent)

  return modifications$
    .merge(source$)
    //.scan((currentData, modFn) => modFn(currentData))//combine existing data with new one
    .scan(function(currentData, modFn){
      //console.log("currentData",currentData,"modFn",modFn)
      //FIXME:awfull hack for sometimes inverted data / function ?? is it due to scan()  api changes?
      if( typeof modFn === "function" ) return modFn(currentData)
      if( typeof currentData === "function" ) return currentData(modFn)

    })
    .shareReplay(1)

}

export default settings