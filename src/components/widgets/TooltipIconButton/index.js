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
  tooltipPos = 'bottom', disabledCondition = false, popOverContent = undefined, position='right') {

  const button = <button
      disabled = {disabledCondition}
      className={Class(mainClass, `tooltip-${tooltipPos}`, {active: toggleCondition})}
      attributes={getToolTip(tooltip, toggleCondition)}>
      <span innerHTML={iconSvg}/>
      <span className='subItemsIndicator'/>
    </button>

  let content
  if (popOverContent !== undefined && toggleCondition) {
    content = <div
      className={Class('popOver', {active: toggleCondition}, `popOver-${position}`)}>
        {popOverContent}
        <b className='border-notch notch'></b>
        <b className='notch'></b>
      </div>
  }

  return <span className='toolTipButtonContainer'>
    {button}
    {content}
    </span>
}
