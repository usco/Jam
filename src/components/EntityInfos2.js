/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest

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

function intent({DOM}){

  const changeName$  = merge(
    DOM.select(".nameInput").events('change').map(e=>e.target.value)
    ,DOM.select(".nameInput").events('input').map(e=>e.target.value)
  )
  const changeColor$ = DOM.select(".colorInput").events('change').map(e=>e.target.value)

  /*const changeTransforms$ = combineLatestObj({
    pos:DOM.select(".transformsInput .pos_0").events('change').map(e=>e.target.value)
  })*/
  function fromTransformInputs(){
    let trans = ['pos','rot','sca']
    let defaults = {pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]}
    let attrs = ['x','y','z']

    return trans.map(function(t){

      let subs= attrs.map(function(name,index){
        let className = `.transformsInput.${t}_${index}`
        return merge(
          DOM.select(className).events('change').map(e=>e.target.value)
          ,DOM.select(className).events('input').map(e=>e.target.value)
        )
        .map(function(value){
          let res = {}
          res[t] = {idx:index,value}
          return res
        })
        .distinctUntilChanged()
      })

      //subs[0].subscribe(e=>console.log("posX",e))

      return merge(subs)
    })
  }



  //change = {rot:{idx:0,val:2}}
  /*const posX$ = merge(
    DOM.select(".transformsInput.pos_0").events('change').map(e=>e.target.value)
    DOM.select(".transformsInput.pos_0").events('input').map(e=>e.target.value)
  ).map(function(value){
    return {pos:{idx:0,value}}
  })
  .distinctUntilChanged()*/
  /*const posY$ = merge(
    DOM.select(".transformsInput.pos_1").events('change').map(e=>e.target.value)
    ,DOM.select(".transformsInput.pos_1").events('input').map(e=>e.target.value)
  )
  const posZ$ = merge(
    DOM.select(".transformsInput.pos_2").events('change').map(e=>e.target.value)
    ,DOM.select(".transformsInput.pos_2").events('input').map(e=>e.target.value)
  )*/
  
  merge( fromTransformInputs()).subscribe(e=>console.log("transforms change",e))
  
  return {
    changeName$
    ,changeColor$
  }
}

////////
function intents(){
  let addComment$          = DOM.select(".comments").events("addComment$").pluck("detail")

}

function model(props$, actions){

}

function CommentsWrapper(state$, DOM){
  const commentsEntity$ = state$.pluck("core")
    .filter(exists)
    .map(e=>e[0])
    .startWith(undefined)

  const props$ = combineLatestObj({
    entity:commentsEntity$
    ,comments:state$.pluck("comments")
  })

  return Comments({DOM,props$})
}


function view(state$, commentsVTree$){
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

function EntityInfos({DOM, props$}, name = '') {
  let comments$   = props$.pluck('comments').filter(exists).startWith(undefined)
  let core$       = props$.pluck('core').filter(exists).startWith(undefined)
  let transforms$ = props$.pluck('transforms').filter(exists).startWith(undefined)

  //comments$.subscribe(e=>console.log("Comments",e))
  /*intent({DOM}).changeName$.subscribe(e=>console.log("changeName",e))
  intent({DOM}).changeColor$.subscribe(e=>console.log("changeColor",e))*/

  const state$ = combineLatestObj({core$, transforms$, comments$})

  const comments = CommentsWrapper(state$,DOM)

  const vtree$ = view(state$,comments.DOM)
  
  return {
    DOM: vtree$,
    events:{
      //selectionTransforms$
      addComment$
    }
  }
}

export default EntityInfos