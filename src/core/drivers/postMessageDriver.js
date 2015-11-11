import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent

function sendMessage(data){
  let {target, message, targetOrigin} = data
  otherWindow.postMessage(message, targetOrigin)// [transfer])
}

function isOriginValid(origins,event){
  return origins.indexOf(event.origin) > -1 
}

export default function postMessageDriver(outgoing$){
  if(outgoing$){
    outgoing$.subscribe(sendMessage)
  }

  return fromEvent(window,'message').pluck("data")//.filter( isOriginValid.bind(null,validOrigins) )
}
