import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent

 //window resize event stream, throttled by throttle amount (250ms default)
 export function windowResizes (throttle=250)
 {
  //only get the fields we need
  function extractSize(x){ 
    let x = x.target
    let bRect = {left:0,top:0,bottom:0,right:0,width:0,height:0}
    if(x.getBoundingClientRect) bRect = x.getBoundingClientRect()

    let res = {width:x.innerWidth, height:x.innerHeight, aspect:x.innerWidth/x.innerHeight, bRect:bRect} 
    return res
  }

  let throttledWinResize = fromEvent(window, 'resize')
  .throttleFirst(throttle /* ms */)
  .map( extractSize )
  .startWith({width:window.innerWidth, height:window.innerHeight, aspect:window.innerWidth/window.innerHeight, bRect:undefined})

  return throttledWinResize
 }

export function elementResizes (element, throttle=250){
  function extractSize(x){ 
    let x = x.target
    let bRect = {left:0,top:0,bottom:0,right:0,width:0,height:0}
    if(x.getBoundingClientRect) bRect = x.getBoundingClientRect()

    let res = {width:x.innerWidth, height:x.innerHeight, aspect:x.innerWidth/x.innerHeight, bRect:bRect} 
    return res
  }

  return Rx.DOM.resize(element) 
  .throttleFirst(throttle /* ms */)
  .map( extractSize )

 }