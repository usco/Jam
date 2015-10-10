/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest

import {formatNumberTo, absSizeFromBBox} from '../../utils/formatters'

function nameInput(core){
   if(core && core.name){
    return (
      <span>
        <input type="text" value={core.name} className="nameInput"/> 
      </span>
    )
  } 
}

function colorInput(core){
  if(core && core.color){
    return (
      <span>
        <input type="color" value={core.color} className="colorInput" /> 
      </span>
    )
  } 
}

function transformInputs(transforms, fieldName, displayName, controlsStep, numberPrecision){
  let inputs = []
  if(transforms && transforms[fieldName]){

    transforms[fieldName].forEach(function(entry, index){
      entry = formatNumberTo(entry, numberPrecision)
      inputs.push(
        <input type="number" value={entry} step={controlsStep} className={`transformsInput ${fieldName}_${index}`}/>
      )
    })

    return (
      <span>
        <span> {displayName}: </span> {inputs}
      </span>
    )
  }
}

export default function view(state$, commentsVTree$){
  let numberPrecision = 2
  let controlsStep = 0.1

  return combineLatest(state$,commentsVTree$
    ,function(state,comments){
      let {core,transforms} = state

      if(!core || !transforms || !comments){
        return undefined
      }
      if(transforms.length>0) transforms = transforms[0]
      if(core.length>0) core = core[0]
        //console.log("core,transforms",core,transforms)

      return <div className="toolBarBottom entityInfos">
        {comments}

        {nameInput(core)}
        {colorInput(core)}
        {transformInputs(transforms, "pos", "P", controlsStep, numberPrecision)}
        {transformInputs(transforms, "rot", "R", controlsStep, numberPrecision)}
        {transformInputs(transforms, "sca", "S", controlsStep, numberPrecision)}
      </div>   
    })
}