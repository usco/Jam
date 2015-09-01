//NEEDED because of circular dependency in annotations...
import {clearActiveTool$} from '../../actions/appActions'
import {keycodes, isValidElementEvent} from '../../interactions/keyboard'

export function settingsIntent(interactions){
  let urlSources = require('../sources/urlSources')


  //hack for firefox only as it does not correct get the "checked" value : note : this is not an issue in cycle.js
  let is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
  function checked(event){
    if(is_firefox) return ! event.target.checked
      return event.target.checked
  }

  /*let showGrid$   = interactions.get(".settingsView .showGrid", "change").map(event => event.target.checked).startWith(false)
  let showAnnot$  = interactions.get(".settingsView .showAnnot", "change").map(event => event.target.checked).startWith(false)
  let autoRotate$ = interactions.get(".settingsView .autoRotate", "change").map(event => event.target.checked).startWith(false)*/
  let showGrid$   = interactions.get(".settingsView .showGrid", "change").map(checked)//.startWith(false)
  let showAnnot$  = interactions.get(".settingsView .showAnnot", "change").map(checked)//.startWith(false)
  let autoRotate$ = interactions.get(".settingsView .autoRotate", "change").map(checked)//.startWith(false)

  let keyUps$ = interactions.subject("keyup")
    .filter(isValidElementEvent)// stop for input, select, and textarea etc 

  //for annotations, should this be here ?
  //heavy code smell  too
  let contextMenuActions$ = interactions.get(".contextMenu", "actionSelected$").pluck("detail")
  let activeTool$       = Rx.Observable.merge(
    contextMenuActions$.filter(e=>e.action === "addNote").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "measureDistance").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "measureDiameter").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "measureThickness").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "measureAngle").pluck("action"),

    contextMenuActions$.filter(e=>e.action === "translate").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "rotate").pluck("action"),
    contextMenuActions$.filter(e=>e.action === "scale").pluck("action"),

    keyUps$.map(e=>keycodes[e.keyCode]).filter(k=>k==="m").map("translate"),
    keyUps$.map(e=>keycodes[e.keyCode]).filter(k=>k==="t").map("translate"),
    keyUps$.map(e=>keycodes[e.keyCode]).filter(k=>k==="r").map("rotate"),
    keyUps$.map(e=>keycodes[e.keyCode]).filter(k=>k==="s").map("scale")

  )
    .startWith(undefined)
    .scan(function(seed,cur){
      if(seed === cur) return undefined
      return cur
    })
    .merge( clearActiveTool$.map(undefined) )

  
  //let webglEnabled$          = Rx.Observable.just(true)
  let appMode$               = urlSources.appMode$//Rx.Observable.just("editor")//what mode is the app in ? ("editor" or "viewer" only for now)
  //let autoSelectNewEntities$ = Rx.Observable.just(true) //TODO: make settable
  //let repeatTool$            = Rx.Observable.just(false) // does a tool gets stopped after a single use or not

  //return {showGrid$,showAnnot$,autoRotate$,activeTool$,appMode$}


  return {
    changeSetting$:
      Rx.Observable.merge(

      showGrid$.map(e=>({showGrid:e}))
      ,showAnnot$.map(e=>({showAnnot:e}))
      ,autoRotate$.map(e=>({autoRotate:e}))
      //,activeTool$.map(e=>({activeTool:e}))
      ,appMode$.map(e=>({appMode:e}))
    ),
      showGrid$
  }
      
  /*return Rx.Observable.combineLatest(
    showGrid$,
    autoRotate$,
    showAnnot$,
    autoSelectNewEntities$,
    webglEnabled$,
    appMode$,
    activeTool$,
    repeatTool$,
    function(showGrid, autoRotate, showAnnot, autoSelectNewEntities,
     webglEnabled, appMode, activeTool, repeatTool){
      return (
        {
          webglEnabled:webglEnabled,
          mode:appMode,
          autoSelectNewEntities:autoSelectNewEntities,
          activeTool,
          repeatTool,

          camera:{
            autoRotate:autoRotate
          },
          grid:{
            show:showGrid
          },
          annotations:{
            show:showAnnot
          }
         
        }
      )
    }
  )*/
}
