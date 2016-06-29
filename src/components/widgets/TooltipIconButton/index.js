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
  tooltipPos = 'bottom', disabledCondition = false, popOverContent = undefined) {
  const button = <button
      disabled = {disabledCondition}
      className={Class(mainClass, `tooltip-${tooltipPos}`, {active: toggleCondition})}
      attributes={getToolTip(tooltip, toggleCondition)}>
      <span innerHTML={iconSvg}/>
    </button>

  let popOver
  if (popOverContent !== undefined && toggleCondition) {
    popOver = <div
      className={Class('popOver', {active: toggleCondition})}>
        {popOverContent}
        <b className='border-notch notch'></b>
        <b className='notch'></b>
      </div>
  }

  return <span className='toolTipButtonContainer'>
    {button}
    {popOver}
    </span>
}
