//NEEDED because of circular dependency in annotations...
//import {clearActiveTool$} from '../../actions/appActions'
import {keycodes, isValidElementEvent} from '../../../interactions/keyboard'
import {combineLatestObj} from '../../../utils/obsUtils'
import {toArray} from '../../../utils/utils'
let merge = Rx.Observable.merge

export function settingsIntent(drivers){
  const {DOM, addressbar, browserCaps} = drivers

  //hack for firefox only as it does not correct get the "checked" value : note : this is not an issue in cycle.js
  let is_firefox_or_chrome  = (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ||
    navigator.userAgent.toLowerCase().indexOf('chrome') > -1 )
  function checked(event){
    //if(is_firefox_or_chrome) return ! event.target.checked
    return event.target.checked
  }

  //camera etc
  const toggleShowGrid$   = DOM.select(".settingsView .showGrid").events("change").map(checked)
  const toggleShowAnnot$  = DOM.select(".settingsView .showAnnot").events("change").map(checked)
  const toggleAutoRotate$ = DOM.select(".settingsView .autoRotate").events("change").map(checked)
  const toggleFullScreen$ = DOM.select(".fullScreenToggler").events("click")
  const toggleWebgl$      = browserCaps.webglEnabled

  //app state/settings
  const setAppMode$       = addressbar.get("appMode").map(d=>d.pop())//what mode is the app in ? ("editor" or "viewer" only for now)
  const setToolsets$      = addressbar.get("tools")
    .map(d=>d.pop())
    .filter(data=>data.length >0)
    .map(function(data){
      if(data.indexOf(',')>-1){
        return data.split(',').filter(d=>d.length>0)
      }else {
        return data
      }
    })
    .map(toArray)
    //.tap(e=>console.log("toolCategories",e))

  //selection
  const toggleAutoSelectNewEntities$ = Rx.Observable.just(true) //TODO: make settable

  //tools
  const toggleRepeatTool$            = Rx.Observable.just(false) // does a tool gets stopped after a single use or not

  let keyUps$ = Rx.Observable.fromEvent(document, 'keyup') //DOM.select(":root").events("keyup")
    .filter(isValidElementEvent)// stop for input, select, and textarea etc

  const setActiveTool$ = merge(
      DOM.select('.toTranslateMode').events("click").map("translate"),
      DOM.select('.toRotateMode').events("click").map("rotate"),
      DOM.select('.toScaleMode').events("click").map("scale"),

      DOM.select('.addNote').events("click").map("addNote"),
      DOM.select('.measureDistance').events("click").map("measureDistance"),
      DOM.select('.measureDiameter').events("click").map("measureDiameter"),
      DOM.select('.measureThickness').events("click").map("measureThickness"),
      DOM.select('.measureAngle').events("click").map("measureAngle"),

      keyUps$.map(e=>keycodes[e.keyCode]).filter(k=>k==="m").map("translate"),
      keyUps$.map(e=>keycodes[e.keyCode]).filter(k=>k==="t").map("translate"),
      keyUps$.map(e=>keycodes[e.keyCode]).filter(k=>k==="r").map("rotate"),
      keyUps$.map(e=>keycodes[e.keyCode]).filter(k=>k==="s").map("scale")
    )
    .scan(function(acc,val){
      console.log("acc",acc,val)
      if(acc===val && val !== undefined){
        acc = undefined
      }else{
        acc = val
      }
      return acc
    })

  //
  const setAllValues$ =  drivers.localStorage.get("jam!-settings")

  return {
    setAllValues$

    ,setActiveTool$
    ,setAppMode$
    ,setToolsets$

    ,toggleAutoRotate$
    ,toggleShowGrid$
    ,toggleShowAnnot$

  }
}
