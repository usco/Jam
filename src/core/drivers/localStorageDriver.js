import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent




export default function localStorageDriver(outgoing$){
  if(outgoing$){
    outgoing$.subscribe(sendMessage)
  }

  return null
}
