/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'
let merge = Rx.Observable.merge

import {combineLatestObj, preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import {formatNumberTo, absSizeFromBBox} from '../utils/formatters'
//import Comments from './Comments'


function changeHandler(fieldName, index, event){
  //console.log("changeHandler",fieldName,index,event)
  let transforms = entity[fieldName]
  let value = event.target.value

  if(fieldName!=="color" && fieldName !=="name" && fieldName !=="comment"){
    value = parseFloat(value)

    //FIXME : needed because of side efect of mutability ugh
    let transforms2 = Object.assign([],transforms)
    transforms2[index] = value
    console.log("reacting to change",fieldName, index, value, transforms, transforms2)
    transforms = transforms2
  }
  else{
    //dealing with color : this needs to be done better
    transforms = value
  }
 
  let output = {iuids:entity.iuid}
  output[fieldName] = transforms
  interactions.subject('selectionTransforms$').onEvent(output)
}

/*
<Comments className="comments" comments={comments} entity={entity} />
              {colorInput(entity, changeHandler)}
              {nameInput(entity,changeHandler)}       
              {absSizeInput(entity,controlsStep,numberPrecision,changeHandler)}
              {extraInputs(entity,numberPrecision,changeHandler)}*/

function transformInputs(transforms, fieldName, displayName, controlsStep, numberPrecision){
  console.log("foo")
  let inputs = []
  if(transforms && transforms[fieldName]){

    transforms[fieldName].forEach(function(entry, index){
      entry = formatNumberTo(entry, numberPrecision)
      inputs.push(
        <input type="number" value={entry} step={controlsStep} />
      )
    })

    return (
      <span>
        <span> {displayName}: </span> {inputs}
      </span>
    )
  }
}

function EntityInfos({DOM, props$}, name = '') {
  //let settings$ = props$.pluck('settings').filter(exists).startWith([])
  let comments$ = props$.pluck('comments').filter(exists).startWith(undefined)
  let transforms$ = props$.pluck('transforms')

  let addComment$          = DOM.select(".comments").events("addComment$").pluck("detail")

  //comments$.subscribe(e=>console.log("Comments",e))

  let numberPrecision = 2
  let controlsStep = 0.1

  const vtree$ = combineLatestObj({transforms$,comments$})
    .map(function({transforms,comments}){

      if(transforms.length>0) transforms = transforms[0]
        console.log("transforms",transforms)

      return <div className="toolBarBottom entityInfos">
        {transformInputs(transforms, "pos", "P", controlsStep, numberPrecision)}
        {transformInputs(transforms, "rot", "R", controlsStep, numberPrecision)}
        {transformInputs(transforms, "sca", "S", controlsStep, numberPrecision)}
      </div>
    })

  return {
    DOM: vtree$,
    events:{
      //selectionTransforms$
      addComment$
    }
  }
}

export default EntityInfos