/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'
let merge = Rx.Observable.merge

import {combineLatestObj, preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import {formatNumberTo, absSizeFromBBox} from '../utils/formatters'
import Comments from './Comments/Comments'


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

function intent({DOM}){

  const changeName$  = merge(
    DOM.select(".nameInput").events('change').map(e=>e.target.value)
    ,DOM.select(".nameInput").events('input').map(e=>e.target.value)
  )
  const changeColor$ = DOM.select(".colorInput").events('change').map(e=>e.target.value)
  
  return {
    changeName$
    ,changeColor$
  }
}

function EntityInfos({DOM, props$}, name = '') {
  //let settings$ = props$.pluck('settings').filter(exists).startWith([])
  let comments$ = props$.pluck('comments').filter(exists).startWith(undefined)
  let core$ = props$.pluck('core')
  let transforms$ = props$.pluck('transforms')

  let addComment$          = DOM.select(".comments").events("addComment$").pluck("detail")

  //comments$.subscribe(e=>console.log("Comments",e))
  intent({DOM}).changeName$.subscribe(e=>console.log("changeName",e))
  intent({DOM}).changeColor$.subscribe(e=>console.log("changeColor",e))

  let numberPrecision = 2
  let controlsStep = 0.1

  const commentsUiProps$ = combineLatestObj({entity:core$.map(e=>e[0]),comments$})
  const commentsUi = Comments({DOM,props$:commentsUiProps$})

  const vtree$ = combineLatestObj({core$, transforms$, comments:commentsUi.DOM})
    .distinctUntilChanged()
    .map(function({core, transforms, comments}){

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

  return {
    DOM: vtree$,
    events:{
      //selectionTransforms$
      addComment$
    }
  }
}

export default EntityInfos