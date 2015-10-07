import {Rx} from '@cycle/core'
import {makeModelNoHistory, mergeData} from '../../utils/modelUtils'
import {generateUUID} from '../../utils/utils'
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
function createComponent(defaults,state,input){
  console.log("createComponent")
  let inputValue =  {}
  if(input && input.value) inputValue = input.value
  const newAttrs = mergeData(defaults,inputValue)

  //auto increment ?
  //auto generate ?
  let id = generateUUID()
  if(input && input.id) id = input.id

  state = mergeData({},state)
  state[id] = newAttrs
  //FIXME big hack, using mutability
  return state 
}

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

//other helpers
function makeActionsFromApiFns(apiFns){

  const actions = Object.keys(apiFns)
    .reduce(function(prev,cur){
      let key = cur+'$'
      prev[key] = new Rx.Subject()
      return prev
    },{})

   return actions
}



////Entity Core//////
export function makeCoreSystem(){
  const defaults = {}

  //defaults for each component in this system
  const componentDefaults ={
    name: "entity",
    typeUid: undefined,
    color: "#07a9ff"
  }

  function setColor(state, input){
    let id  = input.id
    let color = input || state.color
    state = mergeData( state, {color})
    return state
  }

  function setAttribs(state, input){
    let id  = input.id

    let newAttrs = input.value
    let orig = state[id]

    state = mergeData({},state)
    //FIXME big hack, using mutability
    state[id] = mergeData(orig,newAttrs)
    return state
  }

  let updateFns = {setColor, setAttribs
    , createComponent: createComponent.bind(null,componentDefaults)
    , removeComponent}
  let actions   = makeActionsFromApiFns(updateFns)

  let core$ = makeModelNoHistory(defaults, updateFns, actions)

  return {core$,coreActions:actions}
}
////Transforms//////

export function makeTransformsSystem(){
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

  let updateFns = { updateRotation, updatePosition, updateScale, updateTransforms
    , createComponent: createComponent.bind(null,transformDefaults)
    , removeComponent }
  let actions   = makeActionsFromApiFns(updateFns)

  let transforms$ = makeModelNoHistory(defaults, updateFns, actions)

  return {transforms$,transformActions:actions}
}

////Mesh//////
export function makeMeshSystem(){
  const defaults ={
  }

  function createComponentMesh(defaults,state,input){
    console.log("createComponent", input)
    let inputValue =  {}
    if(input && input.value) inputValue = input.value

    let newAttrs = inputValue.mesh //{mesh: inputValue.mesh }// mergeData(defaults,inputValue)

    //auto increment ?
    //auto generate ?
    //let id = generateUUID()
    //if(input && input.id) id = input.id
    let id = input.id

    state = mergeData({},state)
    state[id] = newAttrs
    //FIXME big hack, using mutability
    return state 
  }

  //TODO: should defaults be something like a stand in cube ?
  let updateFns = {
    createComponent: createComponentMesh.bind(null,undefined)
    , removeComponent}
  let actions   = makeActionsFromApiFns(updateFns)

  let meshes$ = makeModelNoHistory(defaults, updateFns, actions)

  return {meshes$,meshActions:actions}
}

////BoundingBox//////
export function makeBoundingSystem(){
  const defaults = {}

  const  boundsDefaults ={
    min:[0,0,0],
    max:[0,0,0]
  }

  let updateFns = {
    createComponent: createComponent.bind(null,boundsDefaults)
    , removeComponent}

  let actions = makeActionsFromApiFns(updateFns)
  let bounds$ = makeModelNoHistory(defaults, updateFns, actions)

  return {bounds$,boundActions:actions}
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


let {core$,coreActions}            = makeCoreSystem()
let {transforms$,transformActions} = makeTransformsSystem()

core$.subscribe(e=>console.log("core",e))
transforms$.subscribe(e=>console.log("transforms",e))

const id1 = generateUUID()
const id2 = generateUUID()


/*setTimeout(function() {
  coreActions.createComponent$.onNext({id:id1, value:{typeUid:0}})
  transformActions.createComponent$.onNext({id:id1, value:{typeUid:0}})

  coreActions.createComponent$.onNext({id:id2, value:{typeUid:0}})
  transformActions.createComponent$.onNext({id:id2, value:{typeUid:0}})
}, 10)

setTimeout(function() {
  transformActions.updatePosition$.onNext({id:id1,value:[-10,2,4]})
  transformActions.updateRotation$.onNext({id:id2,value:[0.56,2.19,0]})
}, 200)


setTimeout(function(){
  transformActions.updateTransforms$.onNext({ 
    id:id1,
    value:{
    pos: [ -1, 76, 0 ],
    rot: [ 0, 8.24, 0 ],
    sca: [ 1, 1.5, 1.5 ]}
    })
},600)*/

/*let {meshes$,meshActions}            = makeMeshSystem()
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

 setTimeout(function(){
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


/*
function render(data){
  console.log("data in render",data)
  let {transforms,bounds,mesh} = data
  //here we could do stuff with meshes, transforms etc
}
combineLatestObj({transforms$, bounds$, mesh$})
  .distinctUntilChanged()
  .subscribe(render)

*/


  