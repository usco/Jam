import Rx from 'rx'
let Observable = Rx.Observable
let just = Observable.just

import { safeJSONParse, toArray } from '../../utils/utils'

export default function localStorageDriver (outgoing$) {
  function getItem (item) {
    return just(localStorage.getItem(item)).map(safeJSONParse)
  }

  function setItem (key, value) {
    return localStorage.setItem(key, value)
  }

  function remove (item) {
    localStorage.removeItem(item)
  }

  function formatOutput (output) {
    toArray(output).map(function (item) {
      Object.keys(item).map(function (key) {
        setItem(key, item[key])
      // console.log(item,key)
      })
    })
  }

  if (outgoing$) {
    // outgoing$.subscribe(setItem)
    outgoing$
      .distinctUntilChanged()
      .subscribe(formatOutput)
  }

  return {
    get: getItem,
    set: setItem,
    remove: remove
  }
}
