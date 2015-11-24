import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent
let just      = Observable.just

import {safeJSONParse, toArray} from '../../utils/utils'

//storage driver for YouMagine designs & data etc
export function youMagineStorageDriver(outgoing$){
  function getItem(item){
    return just( localStorage.getItem(item) ).map(safeJSONParse)
  }

  function setItem(key, value){
    return localStorage.setItem(key,value)
  }

  function remove(item){
    localStorage.removeItem(item)
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


export function makeYoumagineStorageDriver(params){
  this.apiUri    = "http://localhost:3080/api/"
  this.designsUri = this.apiUri+"designs/"
  
  this.designsUri = "https://jamapi.youmagine.com/api/v1/designs/"
  //let designUri = "http://jamapi.youmagine.com/api/v1/designs/test"
  this.rootUri    = undefined
  this.designName = undefined

  this.assembliesFileName = "assemblies.json"//"assemblies_old.json"//"assemblies-simple.json"//
  this.bomFileName        = "bom.json"//"bom_old.json"//"bom.json"
  //TODO: use our pre-exising "stores"
  this._designDocs = []

  //this.assetManager = undefined
  this.store = undefined
}