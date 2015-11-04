/** @jsx hJSX */
import Cycle from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"

export default function tooltipIconBtn(toggleCondition, iconSvg, mainClass, tooltip, 
  tooltipPos = "bottom", disabledCondition=false){
  return <button 
    disabled = {disabledCondition}
    className={Class(mainClass,`tooltip-${tooltipPos}`, {active: toggleCondition})} 
    attributes={{"data-tooltip": tooltip}}>
    <span innerHTML={iconSvg}/>
  </button>
}