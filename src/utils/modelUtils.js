import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge
let just  = Rx.Observable.just

import Immutable from 'seamless-immutable'
import assign from 'fast.js/object/assign'//faster object.assign

//TODO: this needs to be an external lib, for re-use
//merge the current data with any number of input data
export function mergeData(currentData, ...inputs){
  if("merge" in currentData){
    return currentData.merge(inputs)
  }
  return assign({}, currentData, ...inputs)
}

//need to make sure source data structure is right
export function applyDefaults(data$, defaults){
  return data$.map(function(data){
    return mergeData(defaults,data)
  })
}

//need to make sure the "type" (immutable) is right
export function applyTransform(data$, transform){
  return data$.map(function(data){
    return transform(data)
  })
}

function logHistory(currentData, history){
  let past   = [currentData].concat(history.past)
  let future = []

  console.log("currentData",past)
  history = mergeData(history, {past, future})
  return history
}

//history
function makeUndoMod$(actions){
  return actions.undo$
    .map((toggleInfo) => ({state,history}) => {
      console.log("Undoing")

      let nState     = history.past[0]
      let past   = history.past.slice(1)
      let future = [state].concat(history.future)

      history = mergeData(history,{past,future})

      return Immutable({state:nState,history})
    })
}

function makeRedoMod$(actions){
  return actions.redo$
    .map((toggleInfo) => ({state,history}) => {
      console.log("Redoing")

      let nState = history.future[0]
      let past = [state].concat(history.past)
      let future = history.future.slice(1)

      history = mergeData(history,{past,future})

      return Immutable({state:nState,history})
    })
}



///
let transform = Immutable

export function makeModifications(actions, updateFns, options){


  let mods$ =  Object.keys(actions).map(function(key){
    //console.log("actions in makeModifications",key)
    let op     = actions[key]
    let opName = key.replace(/\$/g, "")
    let modFn  = updateFns[opName]

     //how to make this better?
    if(opName==="undo") return makeUndoMod$(actions)
    if(opName === "redo") return makeRedoMod$(actions)

    //here is where the "magic happens"
    //for each "operation/action" we map it to an observable with history & state

    //console.log("op",op,"opName",opName,"modFn",modFn)
    if(modFn && op){

      let mod$   = op
        .map((input) => (state) => {

          if(options.history)
          {
            let history = logHistory(state, state.history)
          }
          state   = modFn(state, input)//call the adapted function

          if(options.history){
            state = {state ,history}
          }


          if(options.doApplyTransform)//if we need to coerce data  to immutable etc
          {
            state = transform(state)
          }

          return state
        })

      return mod$
    }
  })
  .filter(e=>e!==undefined)

  return merge(
    mods$
  )
}


//from futurice/power-ui
/**
* smartStateFold is supposed to be given as the argument a
* `scan` operation over a stream of state|updateFn. State is
* expected to be an object, and updateFn is a function that
* takes old state and produces new state.
* Example:
* --s0---fn1----fn2----s10------>
*      scan(smartStateFold)
* --s0---s1-----s2-----s10------>
*
* where s1 = fn1(s0)
* where s2 = fn2(s1)
*/
export function smartStateFold(prev, curr) {
  //console.log("prev",prev,"cur",curr)
  if (typeof curr === 'function') {
    return curr(prev)
  } else if(typeof curr === 'function'){
    return prev(curr)
  }else{
    return prev
  }
}


export function makeModel(defaults, updateFns, actions, source, options={doApplyTransform:false} ){
  let mods$ =  makeModifications(actions, updateFns, options)

  //console.log("defaults",defaults)
  let source$ = source || just( defaults)
  //  .tap(e=>console.log("source",e))

  source$ = applyDefaults(source$, defaults)

  if(options.doApplyTransform){
   source$ = applyTransform( source$, transform )
  }

  return mods$
   .merge(source$)
   .scan(smartStateFold, defaults)//combine existing data with new one
   //.distinctUntilChanged()
   .shareReplay(1)
}
