/** @jsx hJSX */
import {hJSX} from '@cycle/dom'

import tooltipIconBtn from '../widgets/TooltipIconButton'
import checkbox from '../widgets/Checkbox'
import {transformInputs} from './helpers'


const mainIcon = `<svg width="29px" height="29px" viewBox="0 0 29 29" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>move</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M15,14 L23,14 L23,15 L14,15 L14,14.5 L14,6 L15,6 L15,14 Z M23,10 L23,19 L29,14.5 L23,10 Z M6,10 L6,19 L0,14.5 L6,10 Z M14,14 L6,14 L6,15 L14,15 L14,14 Z M19,23 L10,23 L14.5,29 L19,23 Z M15,15 L15,23 L14,23 L14,15 L15,15 Z M19,6 L10,6 L14.5,0 L19,6 Z" id="move" fill="#000000"></path>
    </g>
</svg>`

export function renderMovingUi (state) {
  const settings = state.settings
  const activeTool = settings.activeTool
  const translateModeToggled = activeTool === 'translate'

  const transformStep = 0.1

  const subTools = <span className='movingSubTools'>
    <div className='transformsGroup'>
      {transformInputs({unit: 'mm', step: transformStep})}
    </div>
    <div className='optionsGroup'>
      <label className='popOverContent'>
        {checkbox({id: 'snapTranslation', className: 'snapTranslation', checked: state.settings.snapRotation})}
        snap translation
      </label>
    </div>
  </span>

  return tooltipIconBtn({toggled: translateModeToggled, icon: mainIcon, klass: 'toTranslateMode',
     tooltip: 'move', tooltipPos: 'bottom', content: subTools})
}

export function view (state$) {
  return state$.map(renderMovingUi)
}
