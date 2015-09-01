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

function makeModification(intent){
  let showGrid$ = intent.showGrid$
    //.startWith(true)
    .map((newData) => (existingData) => {

      console.log("newData",newData)
      let updatedData = Object.assign({},existingData)
      updatedData.grid.show = newData

      return updatedData
    })
  
  return merge(
    showGrid$
  )
}


function model(intent, source) {
  let source$ = source || Observable.just(defaults)
  source$ = applyDefaults(source$)
  let modification$ = makeModification(intent)

  return modification$
    .merge(source$)
    .scan((existingData, modFn) => modFn(existingData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)
}

export default model