require("./app.css")
/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {makeDOMDriver, hJSX} from '@cycle/dom'

import combineTemplate from 'rx.observable.combinetemplate'
let fromEvent = Rx.Observable.fromEvent
let just = Rx.Observable.just

import SettingsView from './components/SettingsView'
import Class from "classnames"


function intent(){
  return Rx.Observable.just({foo:"bar"})
}
function model(){
  return Rx.Observable.just("doo")
}



function view({DOM,props$}){
  const settingProps$ = just({
    settings:{
      grid:{show:true}
      ,annotations:{show:true}
      ,camera:{autoRotate:true}
    }
    ,schema : {
      showGrid:{type:"checkbox",path:"grid.show"}
      ,autoRotate:{type:"checkbox",path:"camera.autoRotate"}
      //,annotations:{type:"checkbox",path:"grid.show"}
    }
  })

  let settingsUi = SettingsView({DOM, props$:settingProps$}, "settingsView")
  let settingsView$ = settingsUi.DOM

  return  Rx.Observable.combineLatest(settingsView$,function(settingsView){
    return <div>
      <span> sttuff </span>
      {settingsView}
    </div>
  })

}



export function main(drivers) {
  let DOM      = drivers.DOM

  let model$ = model(intent(DOM))

  let v = view({DOM})

  return {
      DOM: v
  }
}

