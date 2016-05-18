/** @jsx hJSX */
import Rx from 'rx'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
const combineLatest = Rx.Observable.combineLatest

import {combineLatestObj} from '../../utils/obsUtils'
import {exists} from '../../utils/utils'

import tooltipIconBtn from '../widgets/TooltipIconButton'
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

const translateIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
  width="16" height="16" data-icon="move" viewBox="0 0 16 16" class="icon">
  <path d="M8 0l-3 3h2v4h-4v-2l-3 3 3 3v-2h4v4h-2l2 2 1 1 1-1 2-2h-2v-4h4v2l3-3-3-3v2h-4v-4h2l-3-3z" />
</svg>`

const rotateIconSvg = `<svg version="1.1" id="CCW" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
  width="16" height="16" data-icon="rotate" viewBox="0 0 20 20" class="icon">
  <path d="M0.685,10h2.372V9.795c0.108-4.434,3.724-7.996,8.169-7.996c4.515,0,8.174,3.672,8.174,8.201s-3.659,8.199-8.174,8.199
  c-1.898,0-3.645-0.65-5.033-1.738l1.406-1.504c1.016,0.748,2.27,1.193,3.627,1.193c3.386,0,6.131-2.754,6.131-6.15
  c0-3.396-2.745-6.15-6.131-6.15c-3.317,0-6.018,2.643-6.125,5.945V10h2.672l-3.494,3.894L0.685,10z"/>
</svg>`

const scaleIconSvg = `<svg
  width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" class="icon">
    <!-- Generator: Sketch 3.4 (15575) - http://www.bohemiancoding.com/sketch -->
    <title>Untitled</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <path d="M16,8 L13,5 L13,7 L9,7 L9,9 L13,9 L13,11 L16,8 L16,8 Z M3,11 L3,9 L7,9 L7,7 L3,7 L3,5 L0,8 L3,11 L3,11 Z M8,16 C8.553,16 9,15.951 9,15.4 L9,0.6 C9,0.047 8.553,0 8,0 C7.448,0 7,0.047 7,0.6 L7,15.4 C7,15.951 7.448,16 8,16 L8,16 Z" fill="#555555" sketch:type="MSShapeGroup"></path>
    </g>
</svg>`

const duplicateIconSvg = `<svg version="1.1" id="Copy" xmlns="http://www.w3.org/2000/svg"
  width="16" height="16" x="0px" y="0px" data-icon="duplicate" viewBox="0 0 20 20" class="icon">
<path d="M11,0H3C2.447,0,2,0.447,2,1v12c0,0.552,0.447,1,1,1h5v2h2v-2H8.001v-2H10v-2H8v2H4V2h6v4h2V1C12,0.448,11.553,0,11,0z M8,7
  v1h2V6H9C8.447,6,8,6.447,8,7z M12,20h2v-2h-2V20z M12,8h2V6h-2V8z M8,19c0,0.552,0.447,1,1,1h1v-2H8V19z M17,6h-1v2h2V7
  C18,6.448,17.553,6,17,6z M16,20h1c0.553,0,1-0.448,1-1v-1h-2V20z M16,12h2v-2h-2V12z M16,16h2v-2h-2V16z"/>
</svg>`

const mirrorIconSvg = `<svg width="21px" height="27px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="16" height="16" x="0px" y="0px" data-icon="duplicate" viewBox="0 0 20 20" class="icon">
    <!-- Generator: Sketch 3.7.2 (28276) - http://www.bohemiancoding.com/sketch -->
    <title>mirror</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="mirror" fill="#000000">
            <path d="M16.8156962,11.8582247 C16.4220849,10.8314033 16.4214299,9.16863818 16.8222627,8.12339644 L18.0677373,4.87560356 C18.4649751,3.83973632 17.8982954,3 16.780103,3 L4.69089704,3 C3.58251841,3 3.00231129,3.83036182 3.40299476,4.87560356 L4.64800524,8.12339644 C5.04509508,9.15926368 5.04734243,10.8328971 4.65430384,11.8582247 L0.712696162,22.1407753 C0.319084941,23.1675967 0.89520474,24 2.00056562,24 L19.4694344,24 C20.5743163,24 21.1503424,23.1661029 20.7573038,22.1407753 L16.8156962,11.8582247 Z M5.76196669,10.9349279 C5.94864385,10.4185815 5.95499335,9.5684948 5.78054213,9.04928216 L4.40345787,4.95071784 C4.22703964,4.42565087 4.5224337,4 5.09065483,4 L10.1800244,4 L10.1800244,23 L2.40720205,23 C1.8509532,23 1.55107707,22.5821904 1.73803331,22.0650721 L5.76196669,10.9349279 Z" id="Combined-Shape"></path>
            <rect id="Rectangle-380" x="10" y="0" width="1" height="27" rx="1"></rect>
        </g>
    </g>
</svg>`

const deleteIconSvg = `<svg version="1.1" id="Trash" xmlns="http://www.w3.org/2000/svg"
  width="16" height="16" x="0px" y="0px" data-icon="duplicate" viewBox="0 0 20 20" class="icon">
  <path d="M3.389,7.113L4.49,18.021C4.551,18.482,6.777,19.998,10,20c3.225-0.002,5.451-1.518,5.511-1.979l1.102-10.908
  C14.929,8.055,12.412,8.5,10,8.5C7.59,8.5,5.072,8.055,3.389,7.113z M13.168,1.51l-0.859-0.951C11.977,0.086,11.617,0,10.916,0
  H9.085c-0.7,0-1.061,0.086-1.392,0.559L6.834,1.51C4.264,1.959,2.4,3.15,2.4,4.029v0.17C2.4,5.746,5.803,7,10,7
  c4.198,0,7.601-1.254,7.601-2.801v-0.17C17.601,3.15,15.738,1.959,13.168,1.51z M12.07,4.34L11,3H9L7.932,4.34h-1.7
  c0,0,1.862-2.221,2.111-2.522C8.533,1.588,8.727,1.5,8.979,1.5h2.043c0.253,0,0.447,0.088,0.637,0.318
  c0.248,0.301,2.111,2.522,2.111,2.522H12.07z"/>
</svg>`

const addNoteIconSvg = `<svg version="1.1" id="Flag" xmlns="http://www.w3.org/2000/svg"
  width="16" height="16" x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="icon">
<path d="M18.926,5.584c-9.339,13.568-6.142-0.26-14.037,6.357L6.684,19H4.665L1,4.59l1.85-0.664
  c8.849-6.471,4.228,5.82,15.637,1.254C18.851,5.033,19.142,5.27,18.926,5.584z"/>
</svg>`

const measureDistanceIconSvg = `<svg version="1.1" id="Ruler" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
 width="16" height="16" x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="icon">
<path d="M14.249,0.438L0.438,14.251c-0.584,0.584-0.584,1.538,0.002,2.124l3.185,3.187c0.584,0.584,1.541,0.586,2.124,0.002
  L19.562,5.751c0.584-0.585,0.584-1.541,0-2.125l-3.186-3.188C15.789-0.148,14.834-0.145,14.249,0.438z M3.929,15.312L3.17,16.071
  l-1.896-1.897l0.759-0.759L3.929,15.312z M6.965,15.312l-0.759,0.759l-3.415-3.415l0.759-0.76L6.965,15.312z M6.965,12.276
  l-0.759,0.759l-1.898-1.896l0.76-0.76L6.965,12.276z M8.483,10.758l-0.759,0.759L5.828,9.621l0.759-0.76L8.483,10.758z
   M11.518,10.758l-0.759,0.759L7.345,8.103l0.759-0.759L11.518,10.758z M11.518,7.723l-0.759,0.759L8.863,6.586l0.759-0.759
  L11.518,7.723z M13.036,6.206l-0.759,0.759L10.38,5.068l0.759-0.759L13.036,6.206z M16.072,6.206l-0.76,0.759L11.898,3.55
  l0.759-0.76L16.072,6.206z M16.071,3.171l-0.759,0.759l-1.896-1.898l0.759-0.758L16.071,3.171z"/>
</svg>`

const measureThicknessIconSvg = `<svg version="1.1" id="Vertical_align_middle" xmlns="http://www.w3.org/2000/svg"
   width="16" height="16" x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve" class="icon">
<path fill="#FFFFFF" d="M10,12l-3,3h2v4h2v-4h2L10,12z M13,5h-2V1H9v4H7l3,3L13,5z M18,10c0-0.553-0.048-1-0.6-1H2.6
  C2.048,9,2,9.447,2,10c0,0.551,0.048,1,0.6,1h14.8C17.952,11,18,10.551,18,10z"/>
</svg>`

const measureDiameterIconSvg = `<svg version="1.1"   xmlns="http://www.w3.org/2000/svg"
  width="22px" height="22px" viewBox="0 0 22 22" class="icon">
    <title>Untitled</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <g id="Page-1-+-Oval-17" sketch:type="MSLayerGroup" transform="translate(1.000000, 1.000000)">
            <path d="M17,10 L14,7 L14,9 L10,9 L10,11 L14,11 L14,13 L17,10 L17,10 Z M6,13 L6,11 L10,11 L10,9 L6,9 L6,7 L3,10 L6,13 L6,13 Z" id="Page-1" fill="#000000" sketch:type="MSShapeGroup" transform="translate(10.000000, 10.000000) rotate(-315.000000) translate(-10.000000, -10.000000) "></path>
            <circle id="Oval-17" stroke="#000000" stroke-width="2" sketch:type="MSShapeGroup" cx="10" cy="10" r="10"></circle>
        </g>
    </g>
</svg>`

const measureAngleIconSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
  width="18px" height="18px" viewBox="0 0 18 18" class="icon">
    <title>Untitled</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <polygon id="Triangle-1" stroke="#000000" stroke-width="3" sketch:type="MSShapeGroup" points="0 0 18 18 0 18 "></polygon>
    </g>
</svg>`

function makeTopToolBar(state){
  const selections = state.selections
  const activeTool = state.settings.activeTool
  const toggleControls  = (selections && selections.instIds.length>0)

  const translateModeToggled = activeTool === 'translate'
  const rotateModeToggled = activeTool === 'rotate'
  const scaleModeToggled = activeTool === 'scale'

  const mirrorModeToggled = activeTool === 'mirror'

  const measureDistanceModeToggled = activeTool === 'rotate'
  const measureThicknessModeToggled = activeTool === 'scale'

  const notifications = state.notifications

  const viewIcons = []

  const mirrorSubItems = ['foo', 'bar', 'baz']
    .map(function (name) {
      return <button className={name}>{name}</button>
    })

  /*{ tooltipIconBtn(true,
      mirrorIconSvg, "mirror", "mirror", "bottom", mirrorSubItems)}*/

    function getPopOverContent (popOverType) {
      switch (popOverType) {
        case 'snapScaling':
          return undefined
          return <span>
            <input type='checkbox' className={Class('checkbox', popOverType)} checked='checked' />
            <label className={Class('label', popOverType)}>Snap scaling</label>
          </span>
        case 'snapRotation':
          return undefined
          return <span>
            <input type='checkbox' className={Class('checkbox', popOverType)} checked='checked' />
            <label className={Class('label', popOverType)}> Snap rotation</label>
          </span>
        case 'mirrorSubTools':
        return <span>
          <button className='mirror-x' value='mirror-x'>X</button>
          <button className='mirror-y' value='mirror-y'>Y</button>
          <button className='mirror-z' value='mirror-z'>Z</button>
        </span>
        default:
          return popOverType
      }
    }

  const editIcons = [
    <section>
      {tooltipIconBtn(translateModeToggled
        , translateIconSvg, "toTranslateMode", "move", "bottom")}

      {tooltipIconBtn(rotateModeToggled
        , rotateIconSvg, "toRotateMode", "rotate", "bottom", false, getPopOverContent('snapRotation'))}

      {tooltipIconBtn(scaleModeToggled
        , scaleIconSvg, "toScaleMode", "scale", "bottom", false,  getPopOverContent('snapScaling'))}

      {tooltipIconBtn(mirrorModeToggled
        , mirrorIconSvg, "toMirrorMode", "mirror", "bottom", false, getPopOverContent('mirrorSubTools'))}

    </section>,

    <section>
      {tooltipIconBtn(undefined
        , duplicateIconSvg, "duplicate", "duplicate", "bottom",!toggleControls)}

      {tooltipIconBtn(undefined
        , deleteIconSvg, "delete", "delete", "bottom",!toggleControls)}
    </section>
  ]

  const annotIcons =   [<section>
      {tooltipIconBtn(activeTool === 'addNote'
        , addNoteIconSvg, "addNote", "add note", "bottom")}

      {tooltipIconBtn(activeTool === 'measureDistance'
        , measureDistanceIconSvg, "measureDistance", "measure distance", "bottom")}

      {tooltipIconBtn(activeTool === 'measureThickness'
        , measureThicknessIconSvg, "measureThickness", "measure thickness", "bottom")}

      {tooltipIconBtn(activeTool === 'measureDiameter'
        , measureDiameterIconSvg, "measureDiameter", "measure diameter", "bottom")}

      {tooltipIconBtn(activeTool === 'measureAngle'
        , measureAngleIconSvg, "measureAngle", "measure angle", "bottom")}
    </section>]

  /*if(state.settings.appMode === "viewer"){
    return
  }else{
     return <div className="topToolbar titlebar">
    </div>
  }*/
  const iconSets = {
    'view'     :viewIcons
    ,'edit'    :editIcons
    ,'annotate':annotIcons
    ,'bom'     :undefined
  }

  const icons = state.settings.toolSets
    .map(toolSet => iconSets[toolSet])
    .filter(exists)

  return <div className="topToolbar titlebar">
    {icons}
    <section className="notifications">
      {notifications}
    </section>
  </div>
}


function renderUiElements(uiElements){
  const {state, settings, fsToggler, bom, gl, entityInfos, progressBar, help} = uiElements

  const widgets = {
    'view': renderViewWidgets,
    'edit': renderEditWidgets,
    'annotate': renderAnnotWidgets,
    'bom': renderBomWidgets
  }

  const customWidgets = state.settings.toolSets
    .map(tool => widgets[tool])
    .filter(exists)
    .map(widgetMaker=> widgetMaker(state, uiElements) )


  return <div className="jam" >
    {progressBar}
    {settings}
    {help}
    {fsToggler}

    {gl}

    {customWidgets}

    {makeTopToolBar(state)}

  </div>
}

function renderAnnotWidgets(state, uiElements){
  let {comments} = uiElements
  return [comments]
}

function renderEditWidgets(state, uiElements){
  let { entityInfos, bom } = uiElements
  return [entityInfos, bom]
}

function renderBomWidgets(state, uiElements){
  let { bom } = uiElements
  return [bom]
}

function renderViewWidgets(state, uiElements){
  let {} = uiElements
  return []
}

export default function view(state$, settings$, fsToggler$, bom$
  , gl$, entityInfos$, comment$, progressBar$, help$) {

  return combineLatestObj({state$, settings$, fsToggler$, bom$
  , gl$, entityInfos$, comment$, progressBar$, help$})
    .map(uiElements => {
      return renderUiElements(uiElements)
    })
}
