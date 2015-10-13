/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
let combineLatest = Rx.Observable.combineLatest


export default function view(settingsVTree$, fsTogglerVTree$, bomVtree$, glVtree$, entityInfosVtree$){
  return combineLatest(settingsVTree$, fsTogglerVTree$, bomVtree$, glVtree$, entityInfosVtree$
    ,function(settings, fsToggler, bom, gl, entityInfos){
      return <div>
        {settings}
        {fsToggler}

        {bom}
        {gl}

        {entityInfos}
      </div>
    })
}