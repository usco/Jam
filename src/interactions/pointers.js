import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent
let merge     = Rx.Observable.merge

import logger from '../utils/log'
let log = logger("interactions")
log.setLevel("info")

import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import {normalizeWheel} from './utils'

//various helpers

function hasTwoTouchPoints(event) {
  return event.touches && event.touches.length === 2
}

function getOffset(event) {
  return {
    x: event.offsetX === undefined ? event.layerX : event.offsetX,
    y: event.offsetY === undefined ? event.layerY : event.offsetY
  }
}

function isMoving(moveDelta, deltaSqr){
  return true
  let distSqr  = (moveDelta.x * moveDelta.x + moveDelta.y*moveDelta.y)
  let isMoving = (distSqr > deltaSqr)
  //console.log("moving",isMoving)
  return isMoving
}

function isStatic(moveDelta, deltaSqr){
  return !isMoving(moveDelta)
}

//TODO ,: regroup / refactor all "delta" operation ?
function isShort(elapsed, maxTime){
  return elapsed < maxTime
}

function isLong(elapsed, maxTime){
  return elapsed > maxTime
}

 export function clicks(mouseDowns, mouseUps, mouseMoves, timing=200, deltaSqr){
    /*
    "pseudo click" that does not trigger when there was
    a mouse movement 
    */
    let fakeClicksOld = mouseDowns.flatMap( function( md ){
      let start   = { x: md.clientX, y: md.clientY }

      //get only valid moves 
      let mMoves  = mouseMoves
        .map( false )
        .bufferWithTimeOrCount(timing,1)
        .filter( x => x.length == 1 )
        .map( x => x[0])

      let __moves = mMoves.merge(Observable.return(true))//default to true

      return __moves.combineLatest(mouseUps, function(m, mu){
        //log.info(m, mu)
        var end = {x: mu.clientX, y: mu.clientY }
        return isStatic({start:start,end:end}, deltaSqr)//allow for small movement (shaky hands!)

      })
        .takeUntil(mouseUps)
        .filter( x => x===true )
    })


   let fakeClicks = mouseDowns
    .flatMap( function(downEvent){
        let target = downEvent.currentTarget
        return Observable.amb(
          [
            // Skip if we get a movement before a mouse up
            mouseMoves.take(1).flatMap( x => Rx.Observable.empty() ),
            mouseUps.take(1)
          ])//.map(function(event){console.log(event) return event})
      })


    return fakeClicks
 }

function altMouseMoves( mouseMoves ){
 return mouseMoves
      .skip(1)
      .zip( mouseMoves, function(a, b){
        
        let data = {
            client:{x: a.clientX,y: a.clientY },
            delta:{x: a.clientX - b.clientX, y: a.clientY - b.clientY}
          }
        
          return Object.assign(data, b)
        }
      )
}

/*alternative "clicks" (ie mouseDown -> mouseUp ) implementation, with more fine
grained control*/
function taps(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
  //only doing any "clicks if the time between mDOWN and mUP is below longpressDelay"
  //any small mouseMove is ignored (shaky hands)
   return mouseDowns
      .flatMap( function(downEvent){
        let target = downEvent.currentTarget
        return Observable.amb(
          [
            // Skip if we get a movement before a mouse up
            mouseMoves
              .filter( data => isMoving(data.delta, deltaSqr) )//allow for small movement (shaky hands!)
              .take(1).flatMap( x => Rx.Observable.empty() ),

            mouseUps.take(1),

          ]).timeout(longPressDelay, Rx.Observable.empty())
    })
}

/*this emits events whenever pointers are held */
function holds(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
   return mouseDowns
      .flatMap( function(downEvent){
        let target = downEvent.currentTarget
        return Observable.amb(
          [
            // Skip if we get a movement before timeout
            mouseMoves
              .filter( data => isMoving(data.delta, deltaSqr) )//allow for small movement (shaky hands!)
              .take(1).flatMap( x => Rx.Observable.empty() ),

            //Skip if we get a mouseup before main timeout
            mouseUps.take(1).flatMap( x => Rx.Observable.empty() ),

            Rx.Observable.return(2).delay(longPressDelay).timeout(longPressDelay, Rx.Observable.return(downEvent))

          ])
        //.timeout(longPressDelay, Rx.Observable.empty())
    })
}

/*function drags(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
  return mouseDowns
      .flatMap( function(downEvent){
        let target = downEvent.currentTarget
        //let origin = target.position()
        log.info("kldf")
        return Observable.amb(
          [
            // Skip if we get a mouse up before we move
            mouseUps.take(1).flatMap( x => Rx.Observable.empty() ),

            mouseMoves.take(1).map(function(x){
              return{
                target: target,
                //origin: target.position(),
                drags: mouseMoves.takeUntil(mouseUps).map(function(x){
                  return {
                    delta: x.delta,
                    offset: { 
                      x: x.client.x - downEvent.clientX,
                      y: x.client.y - downEvent.clientY
                    }
                  }
                })
              }
            })

          ])

      })
}

//this one just works by dispatching at the end of the movement
function drags2(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
  return mouseDowns.flatMap(function (md) {
      var start = { x: md.clientX, y: md.clientY }
      return mouseMoves.combineLatest(mouseUps, function (mm, mu) {
        //log.info("mm",mm,"mu",mu)
        var stop = {x: mu.clientX, y: mu.clientY }
        return {
          start: start,
          end: stop
        }
      })
        //.delay(400)
        .takeUntil(mouseUps)
    })
}
*/

//based on http://jsfiddle.net/mattpodwysocki/pfCqq/
function drags3(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
  return mouseDowns.flatMap(function (md) {
    //console.log("drags3 mousedown",md)
    // calculate offsets when mouse down
    var startX = md.offsetX, startY = md.offsetY
    // Calculate delta with mousemove until mouseup
    return mouseMoves
      .map(function (mm) {
        //console.log("drags3 mousemove",mm);
        //(mm.preventDefault) ? mm.preventDefault() : mm.returnValue = false 
        let delta = {
            left: mm.clientX - startX,
            top: mm.clientY - startY
        }
        //console.log("delta",delta)
        return Object.assign(mm, delta)
      })
      .takeUntil(mouseUps)
  })
}

//pinch, taken from https://github.com/hugobessaa/rx-react-pinch
function pinches(touchstarts, touchmoves, touchEnds) {
    return touchStarts
      .do(eventPreventDefault)
      .takeWhile(hasTwoTouchPoints)
      .flatMap(() => {
        return touchMoves
          .pluck('scale')
          .takeUntil(touchEnds)
      })
}


export function interactionsFromEvents(targetEl){
  let mouseDowns$  = fromEvent(targetEl, 'mousedown')
  let mouseUps$    = fromEvent(targetEl, 'mouseup')
  let mouseLeaves$ = fromEvent(targetEl, 'mouseleave').merge(fromCEvent(targetEl, 'mouseout') )
  let mouseMoves$  = altMouseMoves(fromEvent(targetEl, 'mousemove')).takeUntil(mouseLeaves$)
  let rightClicks$ = fromEvent(targetEl, 'contextmenu').do(preventDefault)// disable the context menu / right click
  let zooms$ = fromEvent(targetEl, 'wheel')

  let touchStart$  = fromEvent('touchstart')//dom.touchstart(window)
  let touchMove$   = fromEvent('touchmove')//dom.touchmove(window)
  let touchEnd$    = fromEvent('touchend')//dom.touchend(window)

  return {
    mouseDowns$,
    mouseUps$,
    mouseMoves$,
    rightClicks$,
    zooms$,
    touchStart$,
    touchMoves$,
    touchEnd$
  }
}

/* generate a hash of basic pointer/ mouse event observables*/
export function interactionsFromCEvents(targetEl, rTarget='canvas'){
  /*function fromCEvent(targetEl, eventName){
    return targetEl.get(rTarget, eventName)
  }*/
  function fromCEvent(targetEl, eventName){
    return targetEl.select(rTarget).events(eventName)
  }


  let mouseDowns$  = fromCEvent(targetEl, 'mousedown')
  let mouseUps$    = fromCEvent(targetEl, 'mouseup')
  let mouseLeaves$ = fromCEvent(targetEl, 'mouseleave').merge(fromCEvent(targetEl, 'mouseout') )
  let mouseMoves$  = altMouseMoves(fromCEvent(targetEl, 'mousemove')).takeUntil(mouseLeaves$)
  let rightClicks$ = fromCEvent(targetEl, 'contextmenu').do(preventDefault)// disable the context menu / right click
  let zooms$       = fromCEvent(targetEl, 'wheel')

  let touchStart$  = fromCEvent(targetEl,'touchstart')//dom.touchstart(window)
  let touchMoves$ = fromCEvent(targetEl,'touchmove')//dom.touchmove(window)
  let touchEnd$    = fromCEvent(targetEl,'touchend')//dom.touchend(window)

  /*setTimeout(function() {
    let elem = document.querySelector(".glView")
    fromEvent(elem, 'mousemove').subscribe(e=>console.log("mouseMoves",e))
    let elem2 = document.querySelector(".container")


  }, 15000)*/

  return {
    mouseDowns$,
    mouseUps$,
    mouseMoves$,
    rightClicks$,
    zooms$,
    touchStart$,
    touchMoves$,
    touchEnd$

  }
}

export function pointerInteractions (baseInteractions){  
  let multiClickDelay = 250
  let longPressDelay  = 250

  let minDelta        = 25//max 50 pixels delta
  let deltaSqr        = (minDelta*minDelta)

  let {
    mouseDowns$, mouseUps$, rightclicks$, mouseMoves$, 
    touchStart$, touchMoves$, touchEnd$,
    zooms$ } = baseInteractions

  //mouseMoves$.subscribe(e=>console.log("mousemove",e))

  ///// now setup the more complex interactions
  let taps$ = taps( 
    merge(mouseDowns$,touchStart$), //mouse & touch interactions starts
    merge(mouseUps$,touchEnd$),     //mouse & touch interactions ends
    mouseMoves$, longPressDelay, deltaSqr).share()

  let tapStream$ = taps$
    .filter( event => ('button' in event && event.button === 0) ) //FIXME : bad filter ! 
    .buffer(function() { return taps$.debounce( multiClickDelay ) })
    .map( list => ({list:list,nb:list.length}) )
    .share()


  //normalize zooms (should this be elsewhere)
  zooms$ = zooms$.map(normalizeWheel)

  //we get our custom right clicks
  let rightClicks2 = taps$.filter( event => ('button' in event && event.button === 2) )
  let holds$       = holds(mouseDowns$, mouseUps$, mouseMoves$, longPressDelay, deltaSqr)

  let shortSingleTaps$ = tapStream$.filter( x => x.nb == 1 ).flatMap(e=>e.list)
  let shortDoubleTaps$ = tapStream$.filter( x => x.nb == 2 ).flatMap(e=>e.list).take(1).repeat()
  
  //static , long held taps, for context menus etc
  // longTaps: either HELD leftmouse/pointer or HELD right click
  let longTaps$= holds$.take(1).repeat()

  //drag move interactions (continuously firing)
  let dragMoves$   = merge(
    drags3(mouseDowns$, mouseUps$, mouseMoves$, longPressDelay, deltaSqr),
    touchMoves$
  )
    .takeUntil(longTaps$).repeat()//no drag moves if there is a context action already taking place

  //dragMoves$.subscribe(e=>console.log("dragMoves",e))

  return {
    taps:tapStream$, 
    shortSingleTaps$,
    shortDoubleTaps$,
    longTaps$,
    dragMoves$,
    zooms$
  } 
 }


///////
export function preventScroll(targetEl){
  fromEvent(targetEl, 'mousewheel').subscribe(preventDefault)
  fromEvent(targetEl, 'DOMMouseScroll').subscribe(preventDefault)
  fromEvent(targetEl, 'wheel').subscribe(preventDefault)
}
