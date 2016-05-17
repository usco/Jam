/** @jsx hJSX */
import Cycle from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'

function getPopOverContent (popOverType) {
  switch (popOverType) {
    case 'snapScaling':
      return <span>
        <input type='checkbox' className={Class('checkbox', popOverType)} checked='checked' />
        <label className={Class('label', popOverType)}>Snap scaling</label>
      </span>
    case 'snapRotation':
      return <span>
        <input type='checkbox' className={Class('checkbox', popOverType)} checked='checked' />
        <label className={Class('label', popOverType)}> Snap rotation</label>
      </span>
    default:
      return popOverType
  }
}

function getToolTip (tooltip, toggleCondition) {
  if (!toggleCondition) {
    return {'data-tooltip': tooltip}
  } else {
    return undefined
  }
}

export default function tooltipIconBtn (toggleCondition, iconSvg, mainClass, tooltip,
  tooltipPos = 'bottom', disabledCondition = false, popOverType = undefined) {
  const button = <button
      disabled = {disabledCondition}
      className={Class(mainClass, `tooltip-${tooltipPos}`, {active: toggleCondition})}
      attributes={getToolTip(tooltip, toggleCondition)}>
      <span innerHTML={iconSvg}/>
    </button>

  let popOver
  if (popOverType !== undefined && toggleCondition) {
    popOver = <div
      className={Class('popOver', {active: toggleCondition})}>
        {getPopOverContent(popOverType)}
        <b className='border-notch notch'></b>
        <b className='notch'></b>
      </div>
  }

  return <span className='toolTipButtonContainer'>
    {button}
    {popOver}
    </span>
}
