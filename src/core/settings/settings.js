import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge


///defaults, what else ?
const defaults = {
  webglEnabled:true,
  mode:"viewer",
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


function settings(intent, source) {
  let source$ = source || Observable.just(defaults)
  let modification$ = modification$(intent)

  return modification$
    .merge(source$)
    .scan((entityData, modFn) => modFn(entityData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)
}

export default settings