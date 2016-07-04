/** @jsx hJSX */
import {hJSX} from '@cycle/dom'

export function transformInputs (options) {
  const defaults = {
    fieldName: 'pos',
    unit: 'mm',
    values: [0, 0, 0],
    step: 0.1,

    valuePercents: [0, 0, 0],
    stepPercents: 1,
    showPercents: false,
    axes: ['x', 'y', 'z']
  }
  const {fieldName, unit, values, step, valuePercents, stepPercents, showPercents, axes} = Object.assign({}, defaults, options)

  return axes
    .map(function (axisName, index) {
      const value = values[index]
      const valuePercent = valuePercents[index]
      const percentGroup = showPercents ? <span className='percentGroup'>
        <input id={`${axisName}-scale-pcent`} type='number' lang='en' value={valuePercent} step={stepPercents} className='transformsInputPercent percent'/>
        <span className='unit'>%</span>
      </span> : ''
      return <span className={`axisData ${axisName}-axis`}>
        <span className='valueGroup'>
          <span className='axisName'>{axisName.toUpperCase()}</span>
          <input id={`${axisName}-scale`} type='number' lang='en' value={value} step={step} className='transformsInput value'
          attributes={{ 'data-transform': `${fieldName}_${index}` }} />
          <span className='unit'>{unit}</span>
        </span>
        {percentGroup}
      </span>
    })
}
