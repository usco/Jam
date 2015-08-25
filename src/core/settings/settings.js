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


function modification2(intent){
  let appMode$ = intent.appMode$
    .map((mode) => (settingsData) => {
     
      settingsData.mode = mode
      return settingsData
    })

  let showGrid$ = intent.showGrid$
    .map((showGrid) => (settingsData) => {
     
      //if(!settingsData.grid) settingsData.grid = {}
      //settingsData.grid.show = showGrid
      return settingsData
    })

  return merge(appMode$,showGrid$)
}


function modification(intent){
  //Object.assign({},settingDefaults,lsSettings,settingsSources)
  console.log("intent",intent)

  /*return combineTemplate(
    {
      webglEnabled:true,
      mode:intent.appMode$,

      autoSelectNewEntities:true,
      activeTool:intent.activeTool$,
      repeatTool:false,

      camera:{
        autoRotate:intent.autoRotate$
      },
      grid:{
        show:intent.showGrid$
      },
      annotations:{
        show:intent.showAnnot$
      }
    }
  )*/
  return Rx.Observable.combineLatest(
      intent.appMode$,
      intent.activeTool$,
      intent.autoRotate$,
      intent.showGrid$,
      intent.showAnnot$,function(appMode$,activeTool$,autoRotate$,showGrid$,showAnnot$){
        return {appMode$,activeTool$,autoRotate$,showGrid$,showAnnot$}
      }
    )

  .map(
    function(intent){
      return {
        webglEnabled:true,
        mode:intent.appMode$,

        autoSelectNewEntities:true,
        activeTool:intent.activeTool$,
        repeatTool:false,

        camera:{
          autoRotate:intent.autoRotate$
        },
        grid:{
          show:intent.showGrid$
        },
        annotations:{
          show:intent.showAnnot$
        }
      }

    }
  )
}


function bla(source){

  //let k = Object.keys(source)
  //console.log("k",k)

  let appMode$ = Rx.Observable.just( source["mode"] )
  let activeTool$ = Rx.Observable.just( source["activeTool"] )
  let autoRotate$ = Rx.Observable.just( source.camera.autoRotate )
  let showGrid$ = Rx.Observable.just(source.grid.show)
  let showAnnot$ = Rx.Observable.just(source.grid.showAnnot)

  let result = {appMode$,activeTool$,autoRotate$,showGrid$,showAnnot$}

  console.log("result",result)
  //result.subscribe(e=>console.log("result",e))
  return result
}



function settings(intent, source) {
  let source$ = source || Observable.just(defaults)
  source$ = applyDefaults(source)
  let modifications$ = modification(intent)

  //let sourceIntent = source$.map(bla)
  //intent = Object.assign(intent,sourceIntent)

  /*return modifications$
    .merge(source$)
    //.scan((entityData, modFn) => modFn(entityData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)*/

  return source$
    .merge(modifications$)
    //.scan((settingsData, modFn) => modFn(settingsData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)

  /*return source$
    .merge(modifications$)
    .scan((settingsData, modFn) => modFn(settingsData))//combine existing data with new one
    .shareReplay(1)*/

  /*return modifications$
    .merge(source$)
    .scan((settingsData, modFn) => modFn(settingsData))//combine existing data with new one
    .shareReplay(1)*/

  
  /*return modifications$
    .shareReplay(1)*/
}

export default settings