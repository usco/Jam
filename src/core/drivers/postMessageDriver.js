import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent

function sendMessage(data){
  let {target, message, targetOrigin} = data
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
