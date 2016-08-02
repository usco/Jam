import Rx from 'rx'
import {html} from 'snabbdom-jsx'
import { h } from '@cycle/dom'

import Class from "classnames"
const combineLatest = Rx.Observable.combineLatest

import {combineLatestObj} from '../../utils/obsUtils'
import {exists} from '../../utils/utils'

import Menu from '../widgets/Menu'

import {renderNameAndColorUi} from '../EntityInfos/nameAndColor'
import {renderPositionUi} from '../EntityInfos/position'
import {renderRotationUi} from '../EntityInfos/rotation'
import {renderScaleUi} from '../EntityInfos/scale'
import {renderMirroringUi} from '../EntityInfos/mirroring'

import renderProgressBar from '../widgets/ProgressBar'

import {renderMeasurementsUi} from './measurements'
import {flatten, uniq} from 'ramda'

require('./app.css')
require('./leftToolbar.css')
require('./topToolbar.css')
require('./bottomToolBar.css')

require('./tooltips.css')
require('./notifications.css')
require('../widgets/icon/style.css')

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

const duplicateIcon = `<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 27 27" data-icon="duplicate" class="icon"
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


const deleteIcon = `<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 27 27" class='icon'
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

function renderLeftToolbar (state) {
  const selections = state.selections
  const activeTool = state.settings.activeTool
  const toggleControls = (selections && selections.instIds.length > 0)

  const viewIcons = []

  const editIcons = [
    <section>
      {renderNameAndColorUi(state)}
      {renderPositionUi(state)}
      {renderRotationUi(state)}
      {renderScaleUi(state)}
      {renderMirroringUi(state)}
    </section>,

    <section>
      {Menu({icon: duplicateIcon, klass: 'duplicate',
        tooltip: 'duplicate', tooltipPos: 'bottom', disabledCondition: !toggleControls})}

      {Menu({icon: deleteIcon, klass: 'delete',
        tooltip: 'delete', tooltipPos: 'bottom', disabledCondition: !toggleControls})}
    </section>
  ]
  const annotIcons = [<section>{renderMeasurementsUi(state)}</section>]

  const iconSets = {
    'view': viewIcons,
    'edit': editIcons,
    'annotate': annotIcons,
    'bom': undefined
  }

  let icons = state.settings.toolSets
    .map(toolSet => iconSets[toolSet])
    .filter(exists)

  return h('section#leftToolbar', flatten([icons]))
}

function renderRightToolbar (state, {bom}) {
  const widgetSets = {
    'bom': bom
  }

  const widgetsNames = uniq(flatten(state.settings.toolSets
    .map(toolSet => widgetNamesByToolSet(toolSet)).filter(exists)
  ))
  const widgets = widgetsNames.map(wName => widgetSets[wName])

  return h('section#rightToolbar', widgets)
}

function renderTopToolbar (state) {
  const progressBar = renderProgressBar({progress: state.operationsInProgress * 100})
  return h('section#topToolBar', [ h('section.notifications', [state.notifications]), progressBar ])
}

function renderUiElements (uiElements) {
  const {state, settings, fsToggler, bom, gl, entityInfos, help} = uiElements

  const widgetsMapping = {
    //'comments': comments,
    'entityInfos': entityInfos,
    'bom' : bom
  }

  const widgetsNames = uniq(flatten(state.settings.toolSets
    .map(toolSet => widgetNamesByToolSet(toolSet)).filter(exists)
  ))
  const widgets = widgetsNames.map(wName => widgetsMapping[wName])

  const leftToolbar = renderLeftToolbar(state)
  const rightToolbar = renderRightToolbar(state, uiElements)
  const bottomToolBar = h('section#bottomToolBar', [settings, help, fsToggler])
  const topToolbar = renderTopToolbar(state)

  return h('div.jam', flatten([
    gl,

    leftToolbar,
    rightToolbar,
    topToolbar,
    bottomToolBar
  ]))
}

function widgetNamesByToolSet (toolset) {
  const mappings = {
    'view': [],
    'bom' : ['bom'],
    'edit': ['entityInfos', 'bom'],
    'annot': ['comments']
  }
  return mappings[toolset]
}

export default function view(state$, settings$, fsToggler$, bom$
  , gl$, entityInfos$, comment$, help$) {

  return combineLatestObj({state$, settings$, fsToggler$, bom$, gl$, entityInfos$, comment$, help$})
    .map(renderUiElements)
}
