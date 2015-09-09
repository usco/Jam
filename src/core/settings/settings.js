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

function modificationAlt(actions){  
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
     
      console.log("settingData",settingData)
      let output = Object.assign({},currentData,settingData)

      return output
      //return currentData
    })

  return Observable.merge(
    changeSetting$
    ) 
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
      intent.appMode$.startWith("editor"),
      intent.activeTool$.startWith(undefined),
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



function settings(intent, source) {
  let source$ = source || Observable.just(defaults)
  source$ = applyDefaults(source)

  let modifications$ = modificationAlt(intent)//modification(intent)

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