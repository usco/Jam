/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
let combineLatest = Rx.Observable.combineLatest


export default function view(settingsVTree$, fsTogglerVTree$, bomVtree$, glVtree$, entityInfosVtree$, commentVTree$){
  return combineLatest(settingsVTree$, fsTogglerVTree$, bomVtree$, glVtree$, entityInfosVtree$, commentVTree$
    ,function(settings, fsToggler, bom, gl, entityInfos, comments){
      return <div>
        {settings}
        {fsToggler}

        {bom}
        {gl}

        {comments}
        {entityInfos}

        <div className="topToolbar titlebar">
          <button className="reset"> Reset (debug) </button>

          <button className="clearAll"> Delete all </button>
          <button className="delete">Delete</button>
          <button className="duplicate">Duplicate</button>

          <button className="toTranslateMode">Translate</button>
          <button className="toRotateMode">Rotate</button>
          <button className="toScaleMode">Scale</button>
        </div>

      </div>
    })
}