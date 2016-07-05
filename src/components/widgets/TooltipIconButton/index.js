import { h } from '@cycle/dom'
import { html } from 'snabbdom-jsx'
import Class from 'classnames'
import assign from 'fast.js/object/assign'//faster object.assign

function getToolTip (tooltip, toggleCondition) {
  if (!toggleCondition) {
    return {'data-tooltip': tooltip}
  } else {
    return undefined
  }
}

export default function tooltipIconBtn (options) {
  const defaults = {
    toggled: false,
    disabledCondition: false,

    icon: '',
    klass: '',
    arrow: true,

    contentPosition: 'right',
    subItems: false,

    tooltip: '',
    tooltipPos: 'bottom',

    content: undefined
  }
  const {toggled, disabledCondition, icon, klass, arrow, contentPosition, subItems, tooltip, tooltipPos, content} = assign({}, defaults, options)

  const subItemsIndicator = subItems ? <span className='subItemsIndicator'/> : ''
  // arrow related
  const borderNotch = arrow ? <b className='border-notch notch'></b> : ''
  const notch = arrow ? <b className='notch'></b> : ''

  const button = h('button', {
      props: {
        disabled: disabledCondition,
        className: Class(klass, `tooltip-${tooltipPos}`, {active: toggled})
      },
      attrs: getToolTip(tooltip, toggled)
      },
    [
      h('span', {props: {innerHTML: icon}}),
      subItemsIndicator
    ])

    /*<button
      disabled={disabledCondition}
      className={Class(klass, `tooltip-${tooltipPos}`, {active: toggled})}
      attributes={getToolTip(tooltip, toggled)}>
      <span innerHTML={icon}/>
      {subItemsIndicator}
    </button>*/

  let innerContent = ''
  if (content !== undefined && toggled) {
    innerContent = <div
      className={Class('popOver', `popOver-${contentPosition}`, {'active-content': toggled, arrowOffset: arrow})}>
        {content}
        {borderNotch}
        {notch}
    </div>
  }

  return <span className='toolTipButtonContainer'>
    {button}
    {innerContent}
  </span>
}
