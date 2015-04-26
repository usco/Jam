import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import logger from '../utils/log'
let log = logger("interactions");
log.setLevel("info");


//various helpers
function preventEventDefault(event) {
  event.preventDefault();
}

function hasTwoTouchPoints(event) {
  return event.touches && event.touches.length === 2;
}


function getOffset(event) {
  return {
    x: event.offsetX === undefined ? event.layerX : event.offsetX,
    y: event.offsetY === undefined ? event.layerY : event.offsetY
  };
}

function isMovingOLD(startEnd, deltaSqr){
  let {start,end} = startEnd;
  let offset = {x:end.x-start.x, y:end.y-start.y}
  let distSqr  = (offset.x*offset.x + offset.y * offset.y);
  //log.info(offset,distSqr, deltaSqr)
  return distSqr > deltaSqr;
}

function isMoving(moveDelta, deltaSqr){
  return true;
  let distSqr  = (moveDelta.x * moveDelta.x + moveDelta.y*moveDelta.y);
  let isMoving = (distSqr > deltaSqr);
  //console.log("moving",isMoving)
  return isMoving;
}

function isStatic(moveDelta, deltaSqr){
  return !isMoving(moveDelta);
}

//TODO ,: regroup / refactor all "delta" operation ?
function isShort(elapsed, maxTime){
  return elapsed < maxTime;
}

function isLong(elapsed, maxTime){
  return elapsed > maxTime;
}


 //window resize event stream, throttled by throttle amount (250ms default)
 export let windowResizes=function(throttle=250)
 {
  //only get the fields we need
  let extractSize = function(x){ 
    let x = x.target;
    let bRect = {left:0,top:0,bottom:0,right:0,width:0,height:0}
    if(x.getBoundingClientRect) bRect = x.getBoundingClientRect();

    let res = {width:x.innerWidth, height:x.innerHeight, aspect:x.innerWidth/x.innerHeight, bRect:bRect} 
    return res;
  }

  let throttledWinResize = fromEvent(window, 'resize')
  .throttleFirst(throttle /* ms */)
  .map( extractSize );

  return throttledWinResize;
 }


 export let clicks = function(mouseDowns, mouseUps, mouseMoves, timing=200, deltaSqr){
    /*
    "pseudo click" that does not trigger when there was
    a mouse movement 
    */
    let fakeClicksOld = mouseDowns.flatMap( function( md ){
      let start   = { x: md.clientX, y: md.clientY };

      //get only valid moves 
      let mMoves  = mouseMoves
        .map( false )
        .bufferWithTimeOrCount(timing,1)
        .filter( x => x.length == 1 )
        .map( x => x[0]);

      let __moves = mMoves.merge(Observable.return(true));//default to true

      return __moves.combineLatest(mouseUps, function(m, mu){
        //log.info(m, mu)
        var end = {x: mu.clientX, y: mu.clientY };
        return isStatic({start:start,end:end}, deltaSqr);//allow for small movement (shaky hands!)

      })
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

function altMouseMoves( mouseMoves ){
 return mouseMoves
      .skip(1)
      .zip( mouseMoves, function(a, b){
        
        let data = {
            client:{x: a.clientX,y: a.clientY },
            delta:{x: a.clientX - b.clientX, y: a.clientY - b.clientY}
          };
        
          return Object.assign(data, b);
        }
      );
}

/*alternative "clicks" (ie mouseDown -> mouseUp ) implementation, with more fine
grained control*/
function altClicks(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
  //only doing any "clicks if the time between mDOWN and mUP is below longpressDelay"
  //any small mouseMove is ignored (shaky hands)
   return mouseDowns
      .flatMap( function(downEvent){
        let target = downEvent.currentTarget;
        return Observable.amb(
          [
            // Skip if we get a movement before a mouse up
            mouseMoves
              .filter( data => isMoving(data.delta, deltaSqr) )//allow for small movement (shaky hands!)
              .take(1).flatMap( x => Rx.Observable.empty() ),

            mouseUps.take(1),

          ]).timeout(longPressDelay, Rx.Observable.empty());
    });
}

/*this emits events whenever pointers are held */
function holds(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
   return mouseDowns
      .flatMap( function(downEvent){
        let target = downEvent.currentTarget;
        return Observable.amb(
          [
            // Skip if we get a movement before timeout
            mouseMoves
              .filter( data => isMoving(data.delta, deltaSqr) )//allow for small movement (shaky hands!)
              .take(1).flatMap( x => Rx.Observable.empty() ),

            //Skip if we get a mouseup before main timeout
            mouseUps.take(1).flatMap( x => Rx.Observable.empty() ),

            Rx.Observable.return(2).delay(longPressDelay).timeout(longPressDelay, Rx.Observable.return(42))

          ])
        //.timeout(longPressDelay, Rx.Observable.empty());
    });
}

function drags(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
  return mouseDowns
      .flatMap( function(downEvent){
        let target = downEvent.currentTarget;
        //let origin = target.position();
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

          ]);

      });
}

//this one just works by dispatching at the end of the movement
function drags2(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
  return mouseDowns.flatMap(function (md) {
      var start = { x: md.clientX, y: md.clientY };
      return mouseMoves.combineLatest(mouseUps, function (mm, mu) {
        //log.info("mm",mm,"mu",mu)
        var stop = {x: mu.clientX, y: mu.clientY };
        return {
          start: start,
          end: stop
        };
      })
        //.delay(400)
        .takeUntil(mouseUps);
    });
}


//based on http://jsfiddle.net/mattpodwysocki/pfCqq/
function drags3(mouseDowns, mouseUps, mouseMoves, longPressDelay=800, deltaSqr){
  return mouseDowns.selectMany(function (md) {

            // calculate offsets when mouse down
            var startX = md.offsetX, startY = md.offsetY;

            // Calculate delta with mousemove until mouseup
            return mouseMoves.map(function (mm) {
                (mm.preventDefault) ? mm.preventDefault() : event.returnValue = false; 

                let delta = {
                    left: mm.clientX - startX,
                    top: mm.clientY - startY
                };
                return Object.assign(mm, delta);

            }).takeUntil(mouseUps);
        });
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

 export let pointerInteractions = function(targetEl){
    let multiClickDelay = 250;
    let longPressDelay  = 800;

    let minDelta        = 25;//max 50 pixels delta
    let deltaSqr        = (minDelta*minDelta);

    let mouseDowns  = fromEvent(targetEl, 'mousedown');
    let mouseUps    = fromEvent(targetEl, 'mouseup');
    let mouseMoves  = fromEvent(targetEl, 'mousemove');
    let rightclicks = fromEvent(targetEl, 'contextmenu').do(preventEventDefault);// disable the context menu / right click
    let mouseMoves2 = altMouseMoves(mouseMoves);
    let zoomIntents = fromEvent(targetEl, 'wheel');

    let touchStart  = fromEvent('touchstart');//dom.touchstart(window);
    let touchMove   = fromEvent('touchmove');//dom.touchmove(window);
    let touchEnd    = fromEvent('touchend');//dom.touchend(window);


    ///// now setup the more complex interactions
    let _clicks = altClicks(mouseDowns, mouseUps, mouseMoves2, longPressDelay, deltaSqr).share();

    let clickStreamBase = _clicks
      .filter( event => ('button' in event && event.button === 0) )
      .buffer(function() { return _clicks.debounce( multiClickDelay ); })
      .map( list => ({list:list,nb:list.length}) )
      .share();


    //we get our custom right clicks
    let rightClicks2 = _clicks.filter( event => ('button' in event && event.button === 2) );
    let _holds       = holds(mouseDowns, mouseUps, mouseMoves2, multiClickDelay, deltaSqr);
    

    let unpack = function(list){ return list.list};
    let extractData = function(event){ return {clientX:event.clientX,clientY:event.clientY}};


    let $singleClicks = clickStreamBase.filter( x => x.nb == 1 ).flatMap(unpack);
    let $doubleClicks = clickStreamBase.filter( x => x.nb == 2 ).flatMap(unpack).take(1).map(extractData).repeat();
    let $contextTaps  =  Observable.amb([
      _holds.map(function(x){ console.log("HOLDS");return x}),
      rightClicks2.map(function(x){ console.log("rightClicks2");return x}),
      // Skip if we get a movement
      mouseMoves
        .take(1).flatMap( x => Rx.Observable.empty() ),
      ]
    ).take(1).repeat();// contextTaps: either HELD leftmouse/pointer or right click
    
    let $dragMoves = drags3(mouseDowns, mouseUps, mouseMoves2, longPressDelay, deltaSqr);

    let $zoomIntents = zoomIntents; 

    //zoomIntents.subscribe(function(event){console.log("ZOOM/WHEEL",event)})

    /*$drags.subscribe(function(event){
      console.log("drags",event)
    })*/

    /*_clicks.subscribe(function(event){
      console.log("mouse clicks alt",event)
    })*/

    //let $contextTaps2 = holds(mouseDowns, mouseUps, mouseMoves2, multiClickDelay, deltaSqr)
   
    /*$contextTaps.subscribe(function(event){
      console.log("holdIIIING/right click",event)
    })*/


    //DEBUG
    /*singleClicks.subscribe(function (event) {
        log.info( 'click', event );
    });
    doubleClicks.subscribe(function (event) {
        log.info( 'double click',event);
    });*/
    /*multiClicks.subscribe(function (numclicks) {
        log.info( numclicks+'x click');
    });
        // right click and left long click are the same
    //TODO need a better name
    //var interactions = Observable.merge(rightclick, clickhold);
    */
    Observable.merge($singleClicks, $doubleClicks, $contextTaps, $dragMoves, $zoomIntents)
        //.debounce(200)
        .subscribe(function (suggestion) {});

    return {
      taps:clickStreamBase, 
      singleTaps: $singleClicks, 
      doubleTaps: $doubleClicks, 
      contextTaps:$contextTaps,
      dragMoves:  $dragMoves,
      zoomIntents:$zoomIntents
    } 
 }

