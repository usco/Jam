/** @jsx hJSX */
import Rx from 'rx'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
const combineLatest = Rx.Observable.combineLatest

import {combineLatestObj} from '../../utils/obsUtils'
import {exists} from '../../utils/utils'

import tooltipIconBtn from '../widgets/TooltipIconButton'

import {renderMovingUi} from '../EntityInfos/moving'
import {renderScalingUi} from '../EntityInfos/scaling'
import {renderRotatingUi} from '../EntityInfos/rotating'
import {renderMirroringUi} from '../EntityInfos/mirroring'

/*
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

const duplicateIconSvg = `<svg width="27px" height="27px" viewBox="0 0 27 27" data-icon="duplicate" class="icon"
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>duplicate</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="duplicate" fill="#000000">
            <path d="M10.046237,7.35628664e-16 L11.2381671,3.19560225 L11.3273074,3.43690937 L11.5851694,4.12657524 L12.3954591,6.29864701 L12.5267464,6.64963106 L12.6584327,7.00168174 L12.5267464,7.35373243 L12.3954591,7.70471647 L12.3957657,7.70389584 L7.06245915,22 L6.6893453,22 L6.24208392,21.3510861 L6.37311385,20.999856 L26.6271436,20.999856 L26.7580039,21.3508736 L26.3104877,22 L25.9376312,22 L22.6444276,13.1663628 L22.2960124,12.2345886 L20.6055355,7.70171661 L20.4742482,7.35073256 L20.3425619,6.99868188 L20.4742482,6.64663119 L20.6051904,6.2965711 L21.4153686,4.1241365 L21.5443717,3.77994034 L21.7638315,3.19289661 L22.953861,1.94317006e-15 L23.3266263,4.58032942e-16 L23.7742328,0.649201687 L23.6434325,1.00014399 L9.35684816,1.00014399 L9.22586298,0.648969993 L9.67319158,0 L10.046237,4.58032942e-16 L10.046237,7.35628664e-16 Z M11.4643365,7.35266579 L11.5956238,7.00168174 L11.4643365,6.6506977 L10.6537369,4.47779646 L10.3961353,3.78882778 L10.3056266,3.54383892 L8.98380222,0 L24.0161978,0 L22.695368,3.54383892 L22.4755612,4.13181219 L22.3462631,4.47679651 L21.5366581,6.64769783 L21.4053708,6.99868188 L21.5366581,7.34966592 L23.2274794,11.8834598 L23.5755897,12.8144175 L27,22 L6,22 L11.4643365,7.35266579 L11.4643365,7.35266579 Z" id="Path"></path>
            <polygon id="Path" points="5.46433646 12.3526658 5.59562376 12.0016817 5.46433646 11.6506977 4.65373686 9.47779646 4.39613527 8.78882778 4.3056266 8.54383892 2.98380222 5 18.0161978 5 16.695368 8.54383892 16.4755612 9.13181219 16.3462631 9.47679651 15.5366581 11.6476978 15.4053708 11.9986819 15.5366581 12.3496659 17.2274794 16.8834598 17.5755897 17.8144175 21 27 0 27"></polygon>
        </g>
    </g>
</svg>`


const deleteIconSvg = `<svg width="27px" height="27px" viewBox="0 0 27 27" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>remove</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="remove" fill="#000000">
            <path d="M20.5,15 L20.5,15 C17.4682847,15 15,17.4682847 15,20.5 C15,23.5317153 17.4682847,26 20.5,26 C23.5317153,26 26,23.5317153 26,20.5 C26,17.4682847 23.5317153,15 20.5,15 L20.5,15 Z M20.5,14 L20.5,14 C24.084,14 27,16.916 27,20.5 C27,24.084 24.084,27 20.5,27 C16.916,27 14,24.084 14,20.5 C14,16.916 16.916,14 20.5,14 L20.5,14 Z" id="Shape"></path>
            <path d="M23.554,17.446 C23.359,17.251 23.042,17.251 22.847,17.446 L20.5,19.793 L18.153,17.446 C17.958,17.251 17.641,17.251 17.446,17.446 C17.251,17.641 17.251,17.958 17.446,18.153 L19.793,20.5 L17.446,22.847 C17.251,23.042 17.251,23.359 17.446,23.554 C17.544,23.652 17.672,23.7 17.8,23.7 C17.928,23.7 18.056,23.651 18.154,23.554 L20.501,21.207 L22.848,23.554 C22.946,23.652 23.074,23.7 23.202,23.7 C23.33,23.7 23.458,23.651 23.556,23.554 C23.751,23.359 23.751,23.042 23.556,22.847 L21.207,20.5 L23.554,18.153 C23.749,17.958 23.749,17.642 23.554,17.446 L23.554,17.446 Z" id="Shape"></path>
            <polygon id="Path-93" points="12 22.5 1 22.5 1.46423835 23.1856953 7.46423835 8.18569534 7.54115587 7.99340152 7.45957252 7.80304035 4.45957252 0.803040351 4 1.5 19 1.5 18.5404275 0.803040351 15.5404275 7.80304035 15.4490778 8.0161896 15.5527864 8.2236068 17.5527864 12.2236068 18.4472136 11.7763932 16.4472136 7.7763932 16.4595725 8.19695965 19.4595725 1.19695965 19.7582695 0.5 19 0.5 4 0.5 3.24173049 0.5 3.54042748 1.19695965 6.54042748 8.19695965 6.53576165 7.81430466 0.535761655 22.8143047 0.261483519 23.5 1 23.5 12 23.5"></polygon>
        </g>
    </g>
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
  const toggleControls = (selections && selections.instIds.length > 0)

  const measureDistanceModeToggled = activeTool === 'rotate'
  const measureThicknessModeToggled = activeTool === 'scale'

  const notifications = state.notifications

  const viewIcons = []

  const editIcons = [
    <section>
      {renderMovingUi(state)}
      {renderRotatingUi(state)}
      {renderScalingUi(state)}
      {renderMirroringUi(state)}
    </section>,

    <section>
      {tooltipIconBtn({icon: duplicateIconSvg, klass: 'duplicate',
        tooltip: 'duplicate', tooltipPos: 'bottom', disabledCondition: !toggleControls})}

      {tooltipIconBtn({icon: deleteIconSvg, klass: 'delete',
        tooltip: 'delete', tooltipPos: 'bottom', disabledCondition: !toggleControls})}
    </section>
  ]

  const annotIcons = [<section>
      {tooltipIconBtn({toggled: activeTool === 'addNote', icon: addNoteIconSvg, klass: 'addNote',
        tooltip: 'add note', tooltipPos: 'bottom'})}

      {tooltipIconBtn({toggled: activeTool === 'measureDistance', icon: measureDistanceIconSvg, klass: 'measureDistance',
        tooltip: 'measure distance', tooltipPos: 'bottom'})}

      {tooltipIconBtn({toggled: activeTool === 'measureThickness', icon: measureThicknessIconSvg, klass: 'measureThickness',
        tooltip: 'measure thickness', tooltipPos: 'bottom'})}

      {tooltipIconBtn({toggled: activeTool === 'measureDiameter', icon: measureDiameterIconSvg, klass: 'measureDiameter',
        tooltip: 'measure diameter', tooltipPos: 'bottom'})}

      {tooltipIconBtn({toggled: activeTool === 'measureAngle', icon: measureAngleIconSvg, klass: 'measureAngle',
        tooltip: 'measure angle', tooltipPos: 'bottom'})}
    </section>]

  /*if(state.settings.appMode === "viewer"){
    return
  }else{
     return <div className="topToolbar titlebar">
    </div>
  }*/
  const iconSets = {
    'view': viewIcons,
    'edit': editIcons,
    'annotate': annotIcons,
    'bom': undefined
  }

  const icons = state.settings.toolSets
    .map(toolSet => iconSets[toolSet])
    .filter(exists)

  return <div className="topToolbar">
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

    <section id='bottomToolBar'>
      {settings}
      {help}
      {fsToggler}
    </section>

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
