import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import React from 'react';

import logger from '../utils/log'
let log = logger("Jam-Root");
log.setLevel("info");


export default class App extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidMount(){
    console.log("TESTIN' INTERACTIONS")
    this.setupMouseTrack()
  }
  setupMouseTrack(trackerEl, outputEl){
    console.log("setin' up stuff")
    /*all the cases we need : 
      - single & multiple clicks/taps
      - drags with "ending mouseup" NOT triggering a click event
      - "isStatic hold" long press without much movement delta

      Details:
      

      - single short click : 
        - noMove (distance < minDelta)
        - short (duration < minTime )
        - notMulti
        - start at mouseDown 
        - stop at mouseUp

      - single long click
        - noMove (distance < minDelta)
        - long (duration > minTime )
        - notMulti
        - start at mouseDown 
        - stop at mouseUp

      - multiple short click
        - noMove (distance < minDelta)
        - short (duration < minTime )
        - multi
        - start at mouseDown 
        - stop at mouseUp

      - dragMove
        - move ( distance > minDelta )
        - start at mouseDown 
        - stop at mouseUp

      
    */
    //params, to extract
    let multiClickDelay = 250;
    let longPressDelay  = 600;
    let maxTime         = 600;

    let minDelta        = 50;//max 100 pixels delta
    let deltaSqr        = (minDelta*minDelta);

    let trackerEl = this.refs.wrapper.getDOMNode();

    let clickStream = fromEvent(trackerEl, 'click');
    let mouseDowns  = fromEvent(trackerEl, 'mousedown');
    let mouseUps    = fromEvent(trackerEl, 'mouseup');
    let mouseMoves  = fromEvent(trackerEl, 'mousemove');
    let rightclick  = fromEvent(trackerEl, 'contextmenu').do(
      function(e){ e.preventDefault();
    }); // disable the context menu / right click


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

    //DEFINE ALL INTERACTIONS

    let mouseState = 
      mouseDowns.map(true)
      .merge(
        mouseUps.map(false));


    var _moves = mouseDowns.flatMap(function (md) {
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


    var _holds = mouseState
      .bufferWithTimeOrCount(600,2)
      .filter( x => x.length == 1 )
      .filter( x => x[0] ===true );
    
    var moves   = _moves.filter(isMoving);
    var holds   = _holds;



    /*
    "pseudo click" that does not trigger when there was
    a mouse movement 
    */
    let fakeClicks = mouseDowns.flatMap( function( md ){
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
        .takeUntil(mouseUps)
        .filter( x => x===true )
    });

    /*
    let mouseHold = mousedown.flatMap(function( md ){
      let start   = { x: md.clientX, y: md.clientY };

      //get only valid moves 
      let mMoves  = mouseMoves
        .map( false )
        .bufferWithTimeOrCount(200,1)
        .filter( x => x.length == 1 )
        .map( x => x[0]);

      let __moves = mMoves.merge(Observable.return(true));//default to true

      return __moves;
      return Observable.return(md)
        .delay(400)
        .takeUntil(mouseup);
    });*/
    ///////

    let mouseMovesZip = mouseMoves
      .skip(1)
      .zip( mouseMoves, function(a, b){
        return  {
            client:{x: a.clientX,y: a.clientY },
            delta:{x: a.clientX - b.clientX,y: a.clientY - b.clientY}};
      });

    let mouseMovesAlt = mouseMoves
      .bufferWithCount(2)
      .flatMap( function(data){
        let [a,b] = data;
        return  Observable.return({
            client:{x: a.clientX,y: a.clientY },
            delta:{x: a.clientX - b.clientX,y: a.clientY - b.clientY}});
      });


    let mouseClicksAlt = mouseDowns
      .flatMap( function(downEvent){
        let target = downEvent.currentTarget;
        return Observable.amb(
          [
            // Skip if we get a movement before a mouse up
            mouseMoves.take(1).flatMap( x => Rx.Observable.empty() ),
            mouseUps.take(1)
          ]);
      });


    let mouseDragsAlt = mouseDowns
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
                drags: mouseMovesZip.takeUntil(mouseUps).map(function(x){
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
                   
 



    let clickStreamBase = fakeClicks
      .buffer(function() { return fakeClicks.debounce(multiClickDelay); })
      .map( list => list.length )
      .share();

    let singleClicks = clickStreamBase.filter( x => x == 1 );
    let multiClicks  = clickStreamBase.filter( x => x >= 2 );

    // right click and left long click are the same
    //TODO need a better name
    //var interactions = Observable.merge(rightclick, clickhold);
   

    //DEBUG
    singleClicks.subscribe(function (event) {
        log.info( 'click' );
    });
    multiClicks.subscribe(function (numclicks) {
        log.info( numclicks+'x click');
    });
    Observable.merge(singleClicks, multiClicks, rightclick)
        .debounce(1000)
        .subscribe(function (suggestion) {
    });

    // mouseMovesAlt.subscribe(function (move) {//bufferWithTime(500)//.bufferWithCount(2)
    //  log.info("moves",move)
    // })
    
    holds.subscribe(function (press) {
      log.info("longPress",press)
    });

    mouseClicksAlt.subscribe(function(clicks){
      log.info("mouseClicksAlt",clicks)
    })
    mouseDragsAlt.subscribe(function(drags){
      log.info("mouseDragsAlt",mouseDragsAlt)
    })

    //debug
    /*mouseMoves.subscribe(function (drags) {
      log.info("moves")
    })
    mouseDowns.subscribe(function (down) {
      log.info("down",down)
    })


    mouseUps.subscribe(function (up) {
      log.info("ups")
    })

    mouseDrags.subscribe(function (drags) {
      log.info("drags",drags)
    })

    */

  }


  render(){
    let mainStyle= {
      position: 'absolute',
      width:'100%',
      height:'100%',
    };
    return (
        <div ref="wrapper" style={mainStyle}>
        </div>
    );
  }
}

export default App