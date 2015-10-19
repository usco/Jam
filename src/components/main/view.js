/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
let combineLatest = Rx.Observable.combineLatest


//spinner /loader
/*

function getEntitiesMenuItems(entities){
 let menuItems = [
    {text:"DeleteAll",action:"deleteAll"}
  ]

  let hasParts = ( entities.filter(e=>e.cid === 0) ) .length > 0
  let hasAnnots= ( entities.filter(e=>e.cid !== 0) ) .length > 0

  if(hasParts || hasAnnots){
    menuItems= menuItems.concat([
        {text:"Duplicate", action:"duplicate"}
        ,{text:"Delete",action:"delete"}

      ])
  }

  if(hasParts && !hasAnnots){
    menuItems= menuItems.concat(
      [
        {text:"transforms",items:[
          {text:"translate", action:"translate"}
          ,{text:"rotate",action:"rotate"}
          ,{text:"scale",action:"scale"}
        ]}
        ,

        {text:"annotations",items:[
        {text:"Add note", action:"addNote"},
        {text:"Measure thickness",action:"measureThickness"},
        {text:"Measure Diameter",action:"measureDiameter"},
        {text:"Measure Distance",action:"measureDistance"},
        {text:"Measure Angle",action:"measureAngle"}
        ]}
      ]
    )
  }

  return menuItems
}


let loaderSpinner = null

let _loading = (loading && settings.mode === "viewer" && settings.webglEnabled)
if(_loading){
  loaderSpinner = <span className="spinner" /> 
}

function renderWebglError(){
  return (
    <div className="mainError">
      <span>
        <div className="container-heading">
          <h1>Whoops, it seems you do not have a WebGL capable browser, sorry!</h1>
        </div>
        <div className="container-text">
          <span> <a href="https://get.webgl.org/"> Find out more here  </a> </span>
        </div>
      </span>
    </div>
  )
}*/

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

          <button className="addNote">addNote</button>
          <button className="measureDistance">measureDistance</button>
          <button className="measureDiameter">measureDiameter</button>
          <button className="measureAngle">measureAngle</button>
        </div>

      </div>
    })
}