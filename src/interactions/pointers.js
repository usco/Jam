import Rx from 'rx'
const {fromEvent, merge, empty, just } = Rx.Observable

import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import {normalizeWheel} from './utils'
import assign from 'fast.js/object/assign'//faster object.assign

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

      let __moves = mMoves.merge(just(true))//default to true

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
        return Rx.Observable.amb(
          [
            // Skip if we get a movement before a mouse up
            mouseMoves.take(1).flatMap( x => empty() ),
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

          return assign(data, b)
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
        //const startTime = Date.now()//TODO: use time difference to determine if it was a short or a long tap ?

        return Rx.Observable.amb(
          [
            // Skip if we get a movement before a mouse up
            mouseMoves
              .filter( data => isMoving(data.delta, deltaSqr) )//allow for small movement (shaky hands!)
              .take(1).flatMap( x => empty() ).timeInterval(),


            mouseUps.take(1).timeInterval(),

          ])//.timeout(longPressDelay, empty())
    })
}

/*this emits events whenever pointers are held */
function holds(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
   return mouseDowns
      .flatMap( function(downEvent){
        let target = downEvent.currentTarget
        return Rx.Observable.amb(
          [
            // Skip if we get a movement before timeout
            mouseMoves
              .filter( data => isMoving(data.delta, deltaSqr) )//allow for small movement (shaky hands!)
              .take(1).flatMap( x => empty() ),

            //Skip if we get a mouseup before main timeout
            mouseUps.take(1).flatMap( x => empty() ),

            just(2).delay(longPressDelay).timeout(longPressDelay, just(downEvent))

          ])
        //.timeout(longPressDelay, empty())
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
            mouseUps.take(1).flatMap( x => empty() ),

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
function drags3(mouseDowns$, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
  return mouseDowns$.flatMap(function (md) {
    //console.log("drags3 mousedown",md)
    // calculate offsets when mouse down
    var startX = md.offsetX, startY = md.offsetY
    // Calculate delta with mousemove until mouseup
    return mouseMoves
      .map(function (e) {
        //console.log("drags3 mousemove",mm);
        //(mm.preventDefault) ? mm.preventDefault() : mm.returnValue = false
        let delta = {
            left: e.clientX - startX,
            top: e.clientY - startY
        }
        //console.log("delta",delta)
        return assign({}, e, delta)
      })
      .takeUntil(mouseUps)
  })
}

function touchDrags(touchStart$, touchEnd$, touchMove$){
  return touchStart$
    .flatMap(function(ts){

      let startX = ts.touches[0].pageX
      let startY = ts.touches[0].pageY

      return touchMove$
        .map(function (e) {

          let x = (e.touches[0].pageX - startX)/5.0
          let y = (e.touches[0].pageY - startY)/5.0

          let delta = {
            left: x
            , top: y
            , x
            , y
          }

          let output = assign({}, e, {delta})
          return output

        })
        .takeUntil(touchEnd$)

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

  const mouseDowns$  = fromCEvent(targetEl, 'mousedown')
  const mouseUps$    = fromCEvent(targetEl, 'mouseup')
  const mouseLeaves$ = fromCEvent(targetEl, 'mouseleave').merge(fromCEvent(targetEl, 'mouseout') )
  const mouseMoves$  = altMouseMoves(fromCEvent(targetEl, 'mousemove')).takeUntil(mouseLeaves$)
  const rightClicks$ = fromCEvent(targetEl, 'contextmenu').do(preventDefault)// disable the context menu / right click
  const zooms$       = fromCEvent(targetEl, 'wheel')

  const touchStart$  = fromCEvent(targetEl,'touchstart')//dom.touchstart(window)
  const touchMoves$ = fromCEvent(targetEl,'touchmove')//dom.touchmove(window)
  const touchEnd$    = fromCEvent(targetEl,'touchend')//dom.touchend(window)

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
  const multiClickDelay = 250
  const longPressDelay  = 250

  const minDelta        = 25//max 50 pixels delta
  const deltaSqr        = (minDelta*minDelta)

  let {
    mouseDowns$, mouseUps$, rightclicks$, mouseMoves$,
    touchStart$, touchMoves$, touchEnd$,
    zooms$ } = baseInteractions

  //mouseMoves$.forEach(e=>console.log("mousemove",e))

  ///// now setup the more complex interactions
  const taps$ = taps(
    merge(mouseDowns$,touchStart$), //mouse & touch interactions starts
    merge(mouseUps$,touchEnd$),     //mouse & touch interactions ends
    mouseMoves$, longPressDelay, deltaSqr).share()

  const shortTaps$ = taps$
    .filter(e=>e.interval <= longPressDelay)
    .map(e=>e.value)
    .filter( event => ('button' in event && event.button === 0) ) //FIXME : bad filter !
    .buffer(function() { return taps$.debounce( multiClickDelay ) })
    .map( list => ({list:list,nb:list.length}) )
    .share()

  //normalize zooms (should this be elsewhere ?)
  zooms$ = zooms$.map(normalizeWheel)

  //we get our custom right clicks
  const rightClicks2 = taps$.filter( event => ('button' in event && event.button === 2) )
  const holds$       = holds(mouseDowns$, mouseUps$, mouseMoves$, longPressDelay, deltaSqr)

  const shortSingleTaps$ = shortTaps$.filter( x => x.nb == 1 ).flatMap(e=>e.list)
  const shortDoubleTaps$ = shortTaps$.filter( x => x.nb == 2 ).flatMap(e=>e.list).take(1).repeat()

  //static , long held taps, for context menus etc
  // longTaps: either HELD leftmouse/pointer or HELD right click //FIXME : needs to be "UNTIL" mouseUp
  //and not fire before mouseUp
  const longTaps$= taps$.filter(e=>e.interval > longPressDelay)
    .map(e=>e.value)//holds$.take(1).repeat()//.timeout(longPressDelay, empty())
    //.tap(e=>console.log("taps with LONG timeInterval",e))

  //drag move interactions (continuously firing)
  const dragMoves$   = merge(
    drags3(mouseDowns$, mouseUps$, mouseMoves$, longPressDelay, deltaSqr),
    touchDrags(touchStart$, touchEnd$, touchMoves$)
  )
    .takeUntil(longTaps$).repeat()//no drag moves if there is a context action already taking place

  return {
    taps:taps$.map(e=>e.value),
    shortSingleTaps$,
    shortDoubleTaps$,
    longTaps$,
    dragMoves$,
    zooms$
  }
 }


///////
export function preventScroll(targetEl){
  fromEvent(targetEl, 'mousewheel').forEach(preventDefault)
  fromEvent(targetEl, 'DOMMouseScroll').forEach(preventDefault)
  fromEvent(targetEl, 'wheel').forEach(preventDefault)
}
