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

function modificationAlt(intent){
  console.log("here")
  let appMode$ = intent.sing$
    .map((mode) => (settingsData) => {
      settingsData.mode = mode
      return settingsData
    })

  /*let showGrid$ = intent.showGrid$
    .map((showGrid) => (settingsData) => {
     
      let output = Object.assign({},settingsData)

      if(!output.grid) output.grid = {}
      output.grid.show = showGrid

      return output
      //return settingsData
    })*/

  return appMode$//, showGrid$)
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
      intent.autoRotate$.startWith(false),
      intent.showGrid$.startWith(false),
      intent.showAnnot$.startWith(false),
      function(appMode$,activeTool$,autoRotate$,showGrid$,showAnnot$){
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
  )//.startWith(Rx.Observable.just(defaults))
}


function modification2(intent, initialvalues$){
  console.log("intent",intent)

  let items = [
    intent.appMode$,
    intent.activeTool$,
    intent.autoRotate$,
    intent.showGrid$,
    intent.showAnnot$,
    initialvalues$
  ]
  return Rx.Observable.combineLatest(
      
      initialvalues$,
      function(appMode$,activeTool$,autoRotate$,showGrid$,showAnnot$,initialvalues){
        return {appMode$,activeTool$,autoRotate$,showGrid$,showAnnot$, initialvalues}
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


function modification3(intent, source$){
  console.log("intent",intent)
  //source$.subscribe(e=>console.log("source",e))

  return Rx.Observable.combineLatest(
      intent.appMode$,
      intent.activeTool$,
      intent.autoRotate$,
      intent.showGrid$,
      intent.showAnnot$,
      source$,
      function(appMode$,activeTool$,autoRotate$,showGrid$,showAnnot$,source){
        return {appMode$,activeTool$,autoRotate$,showGrid$,showAnnot$,source}
      }
    )

  .map(
    function(intent){
      console.log("intent showGrid",intent.showGrid$)
      let source = intent.source
      let showGrid$ = source.showGrid$.merge(Rx.Observable.just(intent.showGrid$)).shareReplay(1)
      source.showGrid$.subscribe(e=>console.log("showGrid source",e))
      showGrid$.subscribe(e=>console.log("showGrid final",e))

      return {
        webglEnabled:true,
        mode:source.appMode$.merge(intent.appMode$),

        autoSelectNewEntities:true,
        activeTool:intent.activeTool$,
        repeatTool:false,

        camera:{
          autoRotate:intent.autoRotate$
        },
        grid:{
          show: showGrid$
        },
        annotations:{
          show:intent.showAnnot$
        }
      }

    }
  )
}


function bla(source$){

  //let k = Object.keys(source)
  //console.log("k",k)
  return source$.map(function(source){
    let appMode$ = Rx.Observable.just( source["mode"] )
    let activeTool$ = Rx.Observable.just( source["activeTool"] )
    let autoRotate$ = Rx.Observable.just( source.camera.autoRotate )
    let showGrid$ = Rx.Observable.just(source.grid.show)
    let showAnnot$ = Rx.Observable.just(source.annotations.show)

    let result = {appMode$,activeTool$,autoRotate$,showGrid$,showAnnot$}

    return result
  })
  
  //return result
}



function settings(intent, source) {
  let source$ = source || Observable.just(defaults)
  source$ = applyDefaults(source)
  //let modifications$ = modification(intent)

  //let fakeIntent = {sing$:Rx.Observable.just("viewer")}
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
    //.merge(source$)
    .scan((entityData, modFn) => modFn(entityData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)*/

  /*return modifications$
    .shareReplay(1)*/
}

export default settings