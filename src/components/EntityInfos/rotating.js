
import {html} from 'snabbdom-jsx'
import tooltipIconBtn from '../widgets/TooltipIconButton'
import checkbox from '../widgets/Checkbox'
import {transformInputs} from './helpers'

import { toDegree } from '../../utils/formatters'


const mainIcon = `<svg width="25px" height="24px" viewBox="0 0 25 24" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>rotate</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M20.56,13.492 C23.381,12.471 25,10.963 25,9.296 C25,7.415 22.922,5.787 19.696,4.809 L19.697,4.809 L21.5,0 L3.5,0 L5.304,4.809 C2.079,5.787 0,7.415 0,9.296 C0,11.004 1.669,12.509 4.435,13.508 L0.5,24.001 L24.5,24.001 L20.562,13.502 L20.56,13.492 L20.56,13.492 Z M24,9.296 C24,10.504 22.586,11.702 20.209,12.559 L18.5,8 L19.349,5.738 C22.265,6.607 24,7.979 24,9.296 L24,9.296 Z M3.643,12.078 C3.548,12.033 3.455,11.987 3.366,11.941 C3.27,11.89 3.176,11.84 3.085,11.789 C2.901,11.685 2.728,11.58 2.565,11.473 C2.559,11.469 2.552,11.465 2.546,11.461 C1.568,10.803 1,10.059 1,9.296 C1,7.979 2.735,6.607 5.652,5.738 L5.653,5.742 L6.5,8 L4.791,12.559 C4.379,12.41 3.998,12.248 3.643,12.078 L3.643,12.078 Z M1.943,23.001 L5.386,13.818 C6.375,14.109 7.473,14.341 8.668,14.504 C8.708,14.51 8.749,14.514 8.789,14.519 C8.833,14.525 8.879,14.531 8.924,14.536 L8.924,17.163 L14.104,14.171 L8.924,11.179 L8.924,13.522 C7.778,13.37 6.703,13.15 5.744,12.868 L7.437,8.353 L7.569,8.002 L7.437,7.651 L6.622,5.478 L6.363,4.789 L6.272,4.544 L6.272,4.544 L4.943,1 L20.057,1 L18.729,4.544 L18.508,5.132 L18.378,5.477 L18.378,5.477 L17.564,7.648 L17.432,7.999 L17.564,8.35 L19.264,12.884 L19.614,13.815 L23.057,23.001 L1.943,23.001 L1.943,23.001 Z" id="rotate" fill="#000000"></path>
    </g>
</svg>`

export function renderRotatingUi (state) {
  const settings = state.settings
  const activeTool = state.settings.activeTool
  const rotateModeToggled = activeTool === 'rotate'

  const snapDefaults = 10 // snap rotation snaps to tens of degrees
  const transformStep = settings.snapRotation ? snapDefaults : 0.5
  const precision = 2

  const data = state.selections.instIds.reduce(function (acc, id) {
    acc['transforms'].push(state.transforms[id])
    acc['meta'].push(state.meta[id])
    return acc
  }, {transforms: [], meta: [], settings})

  let { transforms } = data
  if (transforms.length > 0) transforms = transforms[0]

  const values = (transforms.rot || [0, 0, 0]).map(toDegree)//convert to degrees

  const subTools = <span className='rotationSubTools'>
    <div className='transformsGroup'>
      {transformInputs({fieldName: 'rot', unit: '°', step: transformStep, values, precision})}
    </div>
    <div className='optionsGroup'>
      <label className='popOverContent'>
        {checkbox({id: 'snapRotation', className: 'snapRotation', checked: state.settings.snapRotation})}
        snap rotation
      </label>
    </div>
  </span>

  return tooltipIconBtn({toggled: rotateModeToggled, icon: mainIcon, klass: 'toRotateMode',
    tooltip: 'rotate', tooltipPos: 'bottom', content: subTools})
}

export function view (state$) {
  return state$.map(renderRotatingUi)
}
