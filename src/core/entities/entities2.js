import {Rx} from '@cycle/core'
import {makeModelNoHistory} from '../../utils/modelUtils'
import {mergeData, generateUUID} from '../../utils/utils'
import {combineLatestObj} from '../../utils/obsUtils'
let just = Rx.Observable.just

/*
let partInstance = {
    name: data.name,
    iuid: generateUUID(),
    typeUid: data.typeUid,
    color: "#07a9ff",
    pos: [ 0, 0, h/2 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ],
    bbox:data.bbox
}*/

//just experimenting with thoughts about component based system


/////////
//used for all
function removeComponent(state,input){
  console.log("removeComponent")
  let {id} = input

  state = mergeData({},state)
  //FIXME big hack, using mutability
  delete state[id]
  return state 
}

function duplicateEntity(state,input){
  console.log("duplicateEntity")
  let {id,newId} = input

  let clone = mergeData({},state[id]) 

  state = mergeData({},state)
  //FIXME big hack, using mutability
  state[newId] = clone
  return state 
}

//hmm this is the same as remove component ?
function removeEntity(state,input){
  console.log("removeEntity")
  let {id} = input

  state = mergeData({},state)
  //FIXME big hack, using mutability
  delete state[id]
  return state 
}



////Entity Core//////
function makeCoreSystem(name, typeUid){
  const defaults = {}

  const coreDefaults ={
    name: name,
    iuid: generateUUID(),
    typeUid: typeUid,
    color: "#07a9ff"
  }

  function setColor(state, input){
    let color = input || state.color
    state = mergeData( state, {color})
    return state
  }

  let actions = {
    setColor$:new Rx.Subject()
    ,removeComponent$:new Rx.Subject()
  }
  let updateFns = {setColor,removeComponent}
  let core$ = makeModelNoHistory(defaults, updateFns, actions)

  return {core$,coreActions:actions}
}
////Transforms//////

function makeTransformsSystem(){
  const defaults = {}

  const transformDefaults ={
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  }

  function updatePosition(state, input){
    console.log("updatePosition")
    let id  = input.id
    let pos = input.value  || [0,0,Math.random()]
    let orig = state[id] || transformDefaults

    state = mergeData({},state)
    //FIXME big hack, using mutability
    state[id] = mergeData(orig,{pos})
    return state
  }

  function updateRotation(state, input){
    console.log("updateRotation")
    let {id} = input
    let rot = input.value || [0,0,Math.random()]
    let orig = state[id] || transformDefaults

    state = mergeData({},state)
    //FIXME big hack, using mutability
    state[id] = mergeData(orig,{rot})
    return state
  }

  function updateScale(state, input){
    console.log("updateScale")
    let {id} = input
    let sca = input.value || [1,1,Math.random()]
    let orig = state[id] || transformDefaults

    state = mergeData({},state)
    //FIXME big hack, using mutability
    state[id] = mergeData(orig,{sca})
    return state
  }

  function updateTransforms(state, input){
    console.log("updateTransforms")
    let {id} = input
    let transforms = input.value || transformDefaults
    let orig = state[id] || transformDefaults

    state = mergeData({},state)
    //FIXME big hack, using mutability
    state[id] = mergeData(orig,transforms)
    return state
  }


  let updateRotation$ = new Rx.Subject()
  let updatePosition$ = new Rx.Subject()
  let updateScale$    = new Rx.Subject()
  let updateTransforms$ = new Rx.Subject()

  let removeComponent$ = new Rx.Subject()

  let actions   = { updatePosition$, updateRotation$, updateScale$, removeComponent$ }
  let updateFns = { updateRotation,updatePosition,updateScale,removeComponent }

  let transforms$ = makeModelNoHistory(defaults, updateFns, actions)

  return {transforms$,transformActions:actions}
}

////BoundingBox//////
function makeBoundingSystem(){
  const defaults = {}

  const  boundsDefaults ={
    min:[0,0,0],
    max:[0,0,0]
  }

  let actions = {removeComponent$: new Rx.Subject()}
  let updateFns = {removeComponent}
  let bounds$ = makeModelNoHistory(defaults, updateFns, actions)

  return {bounds$,boundActions:actions}
}

////Mesh//////
function makeMeshSystem(xParam){
  const defaults ={
    points: [
      [0,0,1]
      ,[0,1,0]
      ,[1,0,0]
    ]
    ,cells:[0,1,2]
  }

  let actions = {removeComponent$: new Rx.Subject()}
  let updateFns = {removeComponent}
  let mesh$ = makeModelNoHistory(defaults, updateFns, actions)

  return {mesh$,meshActions:actions}
}

////Meta data ///////
function makeMetaDataSystem(){
  const defaults ={
    params:[]
  }

  let actions = {removeComponent$: new Rx.Subject()}
  let updateFns = {removeComponent}
  let meta$ = makeModelNoHistory(defaults, updateFns, actions)

  return {meta$,metaActions:actions}
}

function makeBomSystem(){
  const defaults = []


  function addBomEntry(state,input){

    state = mergeData(state,input)
    return state
  }

  function removeBomEntry(state,input){

    return state
  }

  let actions = {removeComponent$: new Rx.Subject()
    , addBomEntry$:new Rx.Subject()
    , removeBomEntry$: new Rx.Subject()}

  let updateFns = {removeComponent, addBomEntry, removeBomEntry}
  let meta$ = makeModelNoHistory(defaults, updateFns, actions)

  return {bom$,bomActions:actions}
}


let {core$,coreActions}            = makeCoreSystem("apart_"+0, 0)
let {transforms$,transformActions} = makeTransformsSystem()
let {mesh$,meshActions}            = makeMeshSystem()
let {bounds$ ,boundActions}        = makeBoundingSystem()
let {meta$ ,metaActions}           = makeMetaDataSystem()
let {bom$ ,bomActions}             = makeBomSystem()


let components  = {core$, transforms$, bounds$, mesh$, meta$}
let actions  = [coreActions,transformActions,meshActions,boundActions,metaActions]

//bomActions.removeBomEntry$.subscribe(e=>)

let systems$ = combineLatestObj(components)
  systems$.subscribe(e=>console.log("systems",e))


 setTimeout(function() {
    transformActions.updatePosition$.onNext({id:0,value:[-10,2,4]})
    transformActions.updateRotation$.onNext({id:1,value:[0.56,2.19,0]})
    }, 200)


 setTimeout(function() {
    transformActions.updatePosition$.onNext({id:1,value:[0,0,9.987]})
    }, 200)

 /*setTimeout(function(){
    transformActions.removeComponent$.onNext({id:0})
 },400)

  setTimeout(function(){
    deleteEntity(1)
 },800)*/

/////////
function addEntity(inputs){

}

function deleteEntity(id){
  return actions.map(function(action){
    action.removeComponent$.onNext({id})
  })
}

function duplicateEntity(id){
  return actions.map(function(action){
    action.cloneComponent$.onNext({id})
  })
}



function render(data){
  console.log("data in render",data)
  let {transforms,bounds,mesh} = data
  //here we could do stuff with meshes, transforms etc
}
combineLatestObj({transforms$, bounds$, mesh$})
  .distinctUntilChanged()
  .subscribe(render)




  