/** @jsx hJSX */
import {hJSX} from '@cycle/dom'

export function transformInputs (options) {
  const defaults = {
    unit: 'mm',
    step: 0.1,
    stepPercents: 1,
    showPercents: false,
    axes: ['x', 'y', 'z']
  }
  const {unit, step, stepPercents, showPercents, axes} = Object.assign({}, defaults, options)

  return axes
    .map(function (axisName) {
      const percentGroup = showPercents ? <span className='percentGroup'>
        <input id={`${axisName}-scale-pcent`} type='number' lang='en' value='100' step={stepPercents} className='transformsInputPercent percent'/>
        <span className='unit'>%</span>
      </span> : ''
      return <span className={`axisData ${axisName}-axis`}>
        <span className='valueGroup'>
          <span className='axisName'>{axisName.toUpperCase()}</span>
          <input id={`${axisName}-scale`} type='number' lang='en' value='2.7' step={step} className='transformsInput value'/>
          <span className='unit'>{unit}</span>
        </span>
        {percentGroup}
      </span>
    })
}
