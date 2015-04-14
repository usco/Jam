import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import logger from '../utils/log'
let log = logger("interactions");
log.setLevel("info");

//FIXME: HACK ! This should be elsewhere
    let multiClickDelay = 250;
    let longPressDelay  = 600;
    let maxTime         = 600;

    let minDelta        = 50;//max 100 pixels delta
    let deltaSqr        = (minDelta*minDelta);

//various helpers
let getOffset=function(event) {
  return {
    x: event.offsetX === undefined ? event.layerX : event.offsetX,
    y: event.offsetY === undefined ? event.layerY : event.offsetY
  };
}

let isMoving=function(startEnd){
  let {start,end} = startEnd;
  let offset = {x:end.x-start.x, y:end.y-start.y}
  let distSqr  = (offset.x*offset.x + offset.y * offset.y);
  //log.info(offset,distSqr, deltaSqr)
  return distSqr > deltaSqr;
}

let isStatic=function(startEnd){
  return !isMoving(startEnd);
}

//TODO ,: regroup / refactor all "delta" operation ?
let isShort = function(elapsed){
  return elapsed < maxTime;
}

let isLong = function(elapsed){
  return elapsed > maxTime;
}


 //window resize event stream, throttled by throttle amount (250ms default)
 export let windowResizes=function(throttle=250)
 {
  //only get the fields we need
  let extractSize = function(x){ 
    let x = x.target;
    let res = {width:x.innerWidth, height:x.innerHeight, aspect:x.innerWidth/x.innerHeight, bRect:x.getBoundingClientRect()} 
    return res;
  }

  let throttledWinResize = fromEvent(window, 'resize')
  .throttleFirst(throttle /* ms */)
  .map( extractSize );

  return throttledWinResize;
 }

 export let clicks = function(mouseDowns, mouseUps, mouseMoves){
    /*
    "pseudo click" that does not trigger when there was
    a mouse movement 
    */
    let fakeClicksOld = mouseDowns.flatMap( function( md ){
      let start   = { x: md.clientX, y: md.clientY };

      //get only valid moves 
      let mMoves  = mouseMoves
        .map( false )
        .bufferWithTimeOrCount(200,1)
        .filter( x => x.length == 1 )
        .map( x => x[0]);

      let __moves = mMoves.merge(Observable.return(true));//default to true

      return __moves.combineLatest(mouseUps, function(m, mu){
        //log.info(m, mu)
        var end = {x: mu.clientX, y: mu.clientY };
        return isStatic({start:start,end:end});//allow for small movement (shaky hands!)

      })
        //.map(function(event){console.log(event); return event;})
        .takeUntil(mouseUps)
        .filter( x => x===true )
    });


   let fakeClicks = mouseDowns
    .flatMap( function(downEvent){
        let target = downEvent.currentTarget;
        return Observable.amb(
          [
            // Skip if we get a movement before a mouse up
            mouseMoves.take(1).flatMap( x => Rx.Observable.empty() ),
            mouseUps.take(1)
          ])//.map(function(event){console.log(event); return event;})
      });


    return fakeClicks;
 }



 export let pointerInteractions = function(targetEl){
    let multiClickDelay = 250;
    let longPressDelay  = 600;
    let maxTime         = 600;

    let minDelta        = 50;//max 100 pixels delta
    let deltaSqr        = (minDelta*minDelta);


    let clickStream = fromEvent(targetEl, 'click');
    let mouseDowns  = fromEvent(targetEl, 'mousedown');
    let mouseUps    = fromEvent(targetEl, 'mouseup');
    let mouseMoves  = fromEvent(targetEl, 'mousemove');
    let rightclick  = fromEvent(targetEl, 'contextmenu').do(
      function(e){ e.preventDefault();
    }); // disable the context menu / right click

    let _clicks = clicks(mouseDowns, mouseUps, mouseMoves);

    let clickStreamBase = _clicks
      .buffer(function() { return _clicks.debounce( multiClickDelay ); })
      .map( list => ({list:list,nb:list.length}) )
      .share();

    let logSome=function(entry){
      console.log(entry)
      return entry;
    }

    //new CustomEvent('printerstatechanged', { detail: state });

    let unpack = function(list){ return list.list};
    let extractData = function(event){ return {clientX:event.clientX,clientY:event.clientY}};

    let singleClicks = clickStreamBase.filter( x => x.nb == 1 ).flatMap(unpack);
    let doubleClicks = clickStreamBase.filter( x => x.nb == 2 ).flatMap(unpack).take(1).map(extractData).repeat();
    //let multiClicks  = clickStreamBase.filter( x => x.nb >= 2 ).flatMap(unpack);

    // right click and left long click are the same
    //TODO need a better name
    //var interactions = Observable.merge(rightclick, clickhold);

    //DEBUG
    /*singleClicks.subscribe(function (event) {
        log.info( 'click', event );
    });
    doubleClicks.subscribe(function (event) {
        log.info( 'double click',event);
    });*/
    /*multiClicks.subscribe(function (numclicks) {
        log.info( numclicks+'x click');
    });*/
    Observable.merge(singleClicks, doubleClicks, rightclick)
        .debounce(1000)
        .subscribe(function (suggestion) {
    });

    return {taps:clickStreamBase, singleTaps:singleClicks, doubleTaps:doubleClicks} 
 }

