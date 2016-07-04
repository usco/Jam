/** @jsx hJSX */
import {hJSX} from '@cycle/dom'

export function transformInputs (unit = 'mm', showPercents = false, axes = ['x', 'y', 'z']) {
  return axes
    .map(function (axisName) {
      const percentGroup = showPercents ? <span className='percentGroup'>
        <input id={`${axisName}-scale-pcent`} type='number' lang='en' value='100' step='1' className='transformsInputPercent percent'/>
        <span className='unit'>%</span>
      </span> : ''
      return <span className={`axisData ${axisName}-axis`}>
        <span className='valueGroup'>
          <span className='axisName'>{axisName.toUpperCase()}</span>
          <input id={`${axisName}-scale`} type='number' lang='en' value='2.7' step='0.2' className='transformsInput value'/>
          <span className='unit'>{unit}</span>
        </span>
        {percentGroup}
      </span>
    })
}
