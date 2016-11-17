
import {html} from 'snabbdom-jsx'
import Menu from '../widgets/Menu'
import checkbox from '../widgets/Checkbox'
import {transformInputs} from './helpers'

import { absSizeFromBBox } from '../../utils/formatters'


const icon = `<svg viewBox="0 0 24 21" preserveAspectRatio="xMidYMid meet" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>scale</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M21.251,0 L5.149,0 L7.833,6.999 L1.701,7 L3.401,11.667 L0,21 L2.465,21 L13.606,21 L23.935,21 L18.569,6.999 L21.251,0 Z M13.241,20 L10.204,11.667 L11.904,7 L8.903,7 L8.903,6.999 L8.765,6.641 L6.603,1 L19.797,1 L17.635,6.641 L17.497,6.999 L17.635,7.356 L22.481,20 L13.241,20 L13.241,20 Z" id="scale" fill="#000000"></path>
    </g>
</svg>`

export function renderScaleUi (state) {
  const settings = state.settings
  const activeTool = settings.activeTool
  const toggled = activeTool === 'scale'

  const snapDefaults = 0.1 // snap scaling snaps to tens of percentages
  const transformStep = settings.snapScaling ? snapDefaults : 0.1
  const precision = 2
  const min = 0.01

  const data = state.selections.instIds.reduce(function (acc, id) {
    acc['transforms'].push(state.transforms[id])
    acc['meta'].push(state.meta[id])
    acc['bounds'].push(state.bounds[id])
    return acc
  }, {transforms: [], meta: [], bounds: [], settings}) // FIXME: should be based on bounds component, not meshes

  let { transforms, bounds } = data
  if (transforms.length > 0) transforms = transforms[0]

  if(bounds.length > 0) {
    bounds = bounds[0]
  }

  const valuePercents = (transforms.sca || [0, 0, 0]).map(x => x * 100)
  const values = bounds ? (bounds.size || [0, 0, 0]).map((x, index) => x * valuePercents[index] / 100) : [0, 0, 0]
//
  const subTools = <span className='scalingSubTools twoColumns'>
    <div className='transformsGroup'>
      {transformInputs({fieldName: 'sca', unit: '', showPercents: true, step: transformStep, values, valuePercents, precision, min,
      disabled: false, extraKlasses: ['absScaling'] })}
    </div>

    <div className='optionsGroup'>
      <label className='menuContent'>
        {checkbox({id: 'snapScaling', className: 'snapScaling', checked: state.settings.snapScaling})}
        snap scaling
      </label>
      <label className='menuContent'>
        {checkbox({id: 'uniformScaling', className: 'uniformScaling', checked: state.settings.uniformScaling})}
        uniform scaling
      </label>
    </div>

    <div className='defaultsGroup'>
      <label className='resetScaling'>
        <a className='textLink'>Reset Scaling</a>
      </label>
    </div>
  </span>

  return Menu({toggled, icon, klass: 'toScaleMode',
    tooltip: 'scale', tooltipPos: 'bottom', content: subTools})
}

export function view (state$) {
  return state$.map(renderScaleUi)
}
