//NEEDED because of circular dependency in annotations...
import {clearActiveTool$} from '../../actions/appActions'
import {keycodes, isValidElementEvent} from '../../interactions/keyboard'
let merge = Rx.Observable.merge

export function settingsIntent(drivers){
  let DOM = drivers.DOM
  let addressbar = drivers.addressbar

  //hack for firefox only as it does not correct get the "checked" value : note : this is not an issue in cycle.js
  let is_firefox_or_chrome  = (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 || 
    navigator.userAgent.toLowerCase().indexOf('chrome') > -1 )
  function checked(event){
    //if(is_firefox_or_chrome) return ! event.target.checked
    return event.target.checked
  }

  let showGrid$   = DOM.select(".settingsView .showGrid").events("change").map(checked)
  let showAnnot$  = DOM.select(".settingsView .showAnnot").events("change").map(checked)
  let autoRotate$ = DOM.select(".settingsView .autoRotate").events("change").map(checked)

  let appMode$    =  addressbar.get("appMode").map(d=>d.pop()) //urlSources.appMode$//Rx.Observable.just("editor")//what mode is the app in ? ("editor" or "viewer" only for now)


  //let keyUps$ = DOM.select.subject("keyup")
  //  .filter(isValidElementEvent)// stop for input, select, and textarea etc 

  //for annotations, should this be here ?
  //heavy code smell  too
  /*let contextMenuActions$ = DOM.select(".contextMenu", "actionSelected$").pluck("detail")
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
  .merge( clearActiveTool$.map(undefined) )
  */
  
  //let webglEnabled$          = Rx.Observable.just(true)
  //let autoSelectNewEntities$ = Rx.Observable.just(true) //TODO: make settable
  //let repeatTool$            = Rx.Observable.just(false) // does a tool gets stopped after a single use or not

  //return {showGrid$,showAnnot$,autoRotate$,activeTool$,appMode$}

  let activeTool$ =Rx.Observable.just(undefined)

  const changeSetting$ =  merge(
    showGrid$.map(e=>({showGrid:e}))
    ,showAnnot$.map(e=>({showAnnot:e}))
    ,autoRotate$.map(e=>({autoRotate:e}))
    //,activeTool$.map(e=>({activeTool:e}))
    //,appMode$.map(e=>({appMode:e}))
  )

  return {
    changeSetting$
  }
}
