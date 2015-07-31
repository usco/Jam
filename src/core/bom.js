import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from 'log-minim'
let log = logger("app")
log.setLevel("debug")


const defaults = {
  entries:[],
  byId:{},
  selectedEntries:[]
}

function makeModifications(intent){
  //intent.partTypes$.subscribe(e=>console.log("partTypes in BOM"))
  //intent.combos$.subscribe(e=>console.log("combos in BOM"))

  let _addEntries$ = intent.addBomEntries$
    .map((nData) => (bomData) => {
      console.log("ADDING BOM entries")
      //FIXME , immutable
      let newData = nData || []
      if(newData.constructor !== Array) newData = [newData]

      bomData.entries = bomData.entries.concat(newData)

      newData.map( entry =>
         bomData.byId[entry.uuid]= entry
        )

      return bomData
    })

  let newType$ = intent.partTypes$
    .withLatestFrom(intent.combos$,function(types, combos){ return {combos,types}})
    .map((data) => (bomData) => {
      let {combos,types} = data
      console.log("I would register something in BOM", data, bomData)

      let {entries,byId} = bomData

      let typeUid = types.latest
      let entryName = types.typeData[typeUid].name
      let meshName = types.typeUidToMeshName[typeUid]

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
      return { entries, byId, selectedEntries:bomData.selectedEntries }
     })

  console.log("intent",intent)
  /*let bla$ = intent.entities$ 
    .map((data) => (bomData) => {
      console.log("foo",data)

      return bomData
    })*/

  let select$ = intent.selectBomEntries$
    .map((data) => (bomData) => {
      //console.log("select",data)
      bomData.selectedEntries = data
      return bomData
    })

  return merge(
    _addEntries$,
    newType$,
    //bla$,
    select$
  )
}

function Bom(intent, source) {
  console.log("seting up bom model")
  let source$ = source || Observable.just(defaults)
  
  let modification$ = makeModifications(intent)

  return modification$
    .merge(source$)
    .scan((bomData, modFn) => modFn(bomData))//combine existing data with new one
    .shareReplay(1)
}

export default Bom