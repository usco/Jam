import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent
let just      = Observable.just

import {safeJSONParse} from '../../utils/utils'

export function localStorageDriver(outgoing$){
  function getItem(item){
    return just( localStorage.getItem(item) ).map(safeJSONParse)
  }

  function setItem(key, value){
    return localStorage.setItem(key,item)
  }

  function remove(item){
    localStorage.removeItem(item)
  }

  if(outgoing$){
    outgoing$.subscribe(setValue)
  } 

  return {
    get: getItem
    ,set: setItem
    ,remove: remove
  }
}
