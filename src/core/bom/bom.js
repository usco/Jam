import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import {exists} from '../../utils/obsUtils'

import logger from 'log-minim'
let log = logger("app")
log.setLevel("debug")


const defaults = {
  entries:[]
  ,byId:{}
}


function addBomEntries(state,input){
  //console.log("ADDING BOM entries")
  //FIXME , immutable
  let newData = input || []
  if(newData.constructor !== Array) newData = [newData]

  state.entries = state.entries.concat(newData)

  newData.map( entry =>
     state.byId[entry.uuid]= entry
    )

  return state
}

function createBomEntries(state,input){
  let {combos,types} = input
  //console.log("I would register something in BOM", input, state)

  let {entries,byId} = state

  let typeUid   = types.latest
  let type      = types.typeData[typeUid]
  let entryName =  (type !== undefined ? type.name : undefined) 
  let meshName  = types.typeUidToMeshName[typeUid]

  if(type){
    if(! byId[typeUid]){
      let newEntry={
        qty: 1,
        phys_qty: undefined,
        unit: "EA",
        description: undefined,
        uuid: typeUid,
        implementations: {
            "default": meshName
        },
        name: entryName,
        version: "0.0.0"
      }
      
      entries = entries.concat( [newEntry] )
      byId[typeUid] = newEntry
    }
    else
    {
      byId[typeUid].qty +=1
    }
  }
  
  return { entries, byId }
}

//how do we deal with this, as it impacts other data structures ? 
function removeBomEntries(state,input){

}

function clearBomEntries(state, input){
  //console.log("clear BOM", input, state)
  return Object.assign({},defaults)
}

function makeModifications(intent){
  //intent.partTypes$.subscribe(e=>console.log("partTypes in BOM"))
  //intent.combos$.subscribe(e=>console.log("combos in BOM"))

  let addEntries$ = intent.addBomEntries$
    .filter(exists)
    .map((nData) => (bomData) => {
      return addBomEntries(bomData,nData)
    })

  let newType$ = intent.partTypes$
    .withLatestFrom(intent.combos$,function(types, combos){ return {combos,types}})
    .map((data) => (bomData) => {
      return createBomEntries(bomData,data)
     })


  //this means ALL instances represented by bom entries need to be removed!
  let removeEntries$ = intent.removeEntries$
    .map((data) => (bomData) => {
      //console.log("removeEntries from BOM", data, bomData)
      return removeBomEntries(bomData,data)
    })

  //clear it all
  let clearEntries$ = intent.clearEntries$
    .map((data) => (bomData) => {
      return clearBomEntries(bomData,data)
    })

  return merge(
    addEntries$
    ,clearEntries$
    ,removeEntries$
    ,newType$
  )
}

function Bom(intent, source) {
  //console.log("seting up bom model")
  let source$ = source || Observable.just(defaults)
  
  let modification$ = makeModifications(intent)

  return modification$
    .merge(source$)
    .scan((bomData, modFn) => modFn(bomData))//combine existing data with new one
    .shareReplay(1)
}

export default Bom