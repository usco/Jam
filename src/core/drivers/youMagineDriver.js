import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent
let just      = Observable.just

import {safeJSONParse, toArray} from '../../utils/utils'

//storage driver for YouMagine designs & data etc
export function youMagineStorageDriver(outgoing$){
  function formatOutput(){
  }

  function getItem(item){
    return just( {} ).map(safeJSONParse)
  }

  function setItem(key, value){
    //return localStorage.setItem(key,value)
  }

  function remove(item){
    //removeItem(item)
  }

 
  if(outgoing$){
    outgoing$
      .distinctUntilChanged()
      .subscribe(formatOutput)
  } 

  return {
    get: getItem
    ,set: setItem
    ,remove: remove
  }
}


export default function makeYMDriver(httpDriver, params){
  const apiUri    = "http://localhost:3080/api/"
  const designsUri = apiUri+"designs/"
  
  //designsUri = "https://jamapi.youmagine.com/api/v1/designs/"
  //let designUri = "http://jamapi.youmagine.com/api/v1/designs/test"
  const rootUri    = undefined
  const designName = undefined

  const assembliesFileName = "assemblies.json"//"assemblies_old.json"//"assemblies-simple.json"//
  const bomFileName        = "bom.json"//"bom_old.json"//"bom.json"

  //TODO: use our pre-exising "stores"
  const _designDocs = []

  //this.assetManager = undefined
  const store = undefined

  return youMagineStorageDriver
}