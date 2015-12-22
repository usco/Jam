import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent
import assign from 'fast.js/object/assign'//faster object.assign

function sendMessage(data){
  let {target, message, targetOrigin, requestName} = data 
  message = assign({},{data:message},{source:"jam",request:requestName})//add source & request field for external use
  target.postMessage(message, targetOrigin)// [transfer])
}

function isOriginValid(origins,event){
  return origins.indexOf(event.origin) > -1 
}

export default function postMessageDriver(outgoing$){
  if(outgoing$){
    outgoing$
      .subscribe(sendMessage)
  }

  const incoming$ = fromEvent(window,'message')
    .map(e=>({data:e.data, origin:e.origin, source:e.source}))
    //.distinctUntilChanged()
    .share()
    //.do(e=>console.log("postMessage",e))//why does this fire multiple time ?

  return incoming$//.filter( isOriginValid.bind(null,validOrigins) )

} 
