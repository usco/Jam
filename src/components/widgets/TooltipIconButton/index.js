/** @jsx hJSX */
import { hJSX } from '@cycle/dom'
import Class from 'classnames'

function getToolTip (tooltip, toggleCondition) {
  if (!toggleCondition) {
    return {'data-tooltip': tooltip}
  } else {
    return undefined
  }
}

export default function tooltipIconBtn (toggleCondition, iconSvg, mainClass, tooltip,
  tooltipPos = 'bottom', disabledCondition = false, popOverContent = undefined, arrow=true, subItems=false, position='right', size='large') {

  const subItemsIndicator = subItems? <span className='subItemsIndicator'/> : ''
  // arrow related
  const borderNotch = arrow ? <b className='border-notch notch'></b> : ''
  const notch = arrow ? <b className='notch'></b> : ''

  const button = <button
      disabled = {disabledCondition}
      className={Class(mainClass, `tooltip-${tooltipPos}`, {active: toggleCondition})}
      attributes={getToolTip(tooltip, toggleCondition)}>
      <span innerHTML={iconSvg}/>
      {subItemsIndicator}
    </button>

  let content
  if (popOverContent !== undefined && toggleCondition) {
    content = <div
      className={Class('popOver', `popOver-${position} ${size}`, {active: toggleCondition, arrowOffset: arrow})}>
        {popOverContent}
        {borderNotch}
        {notch}
      </div>
  }

  return <span className='toolTipButtonContainer'>
    {button}
    {content}
    </span>
}
