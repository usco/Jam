import { h } from '@cycle/dom'
import {html} from 'snabbdom-jsx'
import { formatNumberTo } from '../../utils/formatters'

export function transformInputs (options) {
  const defaults = {
    fieldName: 'pos',
    unit: 'mm',
    values: [0, 0, 0],
    step: 0.1,
    precision: 2,

    valuePercents: [0, 0, 0],
    stepPercents: 1,
    showPercents: false,
    axes: ['x', 'y', 'z']
  }
  const {fieldName, unit, values, step, precision, valuePercents, stepPercents, showPercents, axes} = Object.assign({}, defaults, options)

  return axes
    .map(function (axisName, index) {
      const value = formatNumberTo(values[index], precision)
      const valuePercent = valuePercents[index]
      const percentGroup = showPercents ? h('span.percentGroup', [
        h(`input#${axisName}-scale-pcent`,
          { props: {type: 'number', lang: 'en', className: 'transformsInputPercent percent', value: valuePercent, step: stepPercents},
            attrs: {'data-transform': `${fieldName}_${index}`}
          }),
        h('span.unit', ['%'])
      ]) : ''

      /*<span className='percentGroup'>
        <input id={`${axisName}-scale-pcent`} type='number' lang='en' value={valuePercent} step={stepPercents}
          className='transformsInputPercent percent' attributes={{ 'data-transform': `${fieldName}_${index}` }} />
        <span className='unit'>%</span>
      </span> : ''*/
      return h('span', {props: {className: `axisData ${axisName}-axis`}}, [
        h('span.valueGroup', [
          h('span.axisName', [axisName.toUpperCase()]),
          h(`input#${axisName}-scale`,
            { key: 'foo' + index + Math.random(),
              props: {type: 'number', lang: 'en', className: 'transformsInput value', value, step},
              attrs: {'data-transform': `${fieldName}_${index}`}
            }),
          h('span.unit', [unit])
        ]),
        percentGroup
      ])


      /*<span className={`axisData ${axisName}-axis`}>
        <span className='valueGroup'>
          <span className='axisName'>{axisName.toUpperCase()}</span>
          <input id={`${axisName}-scale`} key={'foo'+index+Math.random()} type='number' lang='en' value={value} step={step}
            className='transformsInput value' attributes={{ 'data-transform': `${fieldName}_${index}` }} />
          <span className='unit'>{unit}</span>
        </span>
        {percentGroup}
      </span>*/
    })
}
