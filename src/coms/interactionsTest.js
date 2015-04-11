import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent;
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

    let minDelta        = 100;//max 100 pixels delta
    let deltaSqr        = (minDelta*minDelta);

    let trackerEl = this.refs.wrapper.getDOMNode();

    let clickStream = fromEvent(trackerEl, 'click');
    let mouseDowns  = fromEvent(trackerEl, 'mousedown');
    let mouseUps    = fromEvent(trackerEl, 'mouseup');
    let mouseMoves  = fromEvent(trackerEl, 'mousemove');


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
      return !isMoving;
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


    var _moves = mouseDowns.selectMany(function (md) {
      var start = { x: md.clientX, y: md.clientY };
      return mouseMoves.combineLatest(mouseUps, function (mm, mu) {
        //log.info("mm",mm,"mu",mu)
        var stop = {x: mu.clientX, y: mu.clientY };
        return {
          start: start,
          end: stop
        };
      }).takeUntil(mouseUps);
    });


    var _holds = mouseState
      .bufferWithTimeOrCount(600,2)
      .filter( x => x.length == 1 )
      .filter( x => x[0] ===true );

    
    var moves = _moves.filter(isMoving);
    var holds = _holds.selectMany( function(h){

      return _holds.takeUntil( moves ).last()
    });//.takeUntil( isStatic );


    var blaTest = mouseDowns.selectMany( function( md ){
      //log.info("blaz",md)
      //mouseDowns.skipUntil(mouseUps).repeat()
      return ""
    });

    let fakeClicks = mouseDowns.selectMany( function(md,mm ){
      log.info("here")
      return mouseMoves.map(true).filter( x => x!==true ).bufferWithTimeOrCount(20,1).takeUntil( mouseUps );//.filter( x => x.length == 0 )
      /*.select( function(bla){
        log.info("mlk",bla)
        return ""
      });*/

      /*return mouseMoves.bufferWithTimeOrCount(20,1).takeUntil( mouseUps ).filter( x => x.length == 0 )//.lastOrDefault(null, 0);
      .select( function(bla){
        return bla
      });*/



    });

    fakeClicks.subscribe(function (item) {
      log.info("blaTest",item)
    })


    /*let mouseDrags = mouseDowns.selectMany(function (md) {
      // calculate offsets when mouse down
      var startX = md.offsetX, startY = md.offsetY;
      // Calculate delta with mousemove until mouseup
      return mouseMoves.map(function (mm) {
          //(mm.preventDefault) ? mm.preventDefault() : event.returnValue = false; 
          return {
              left: mm.clientX - startX,
              top: mm.clientY - startY
          };
      }).takeUntil(mouseUps);
    });*/

    //debug
    /*mouseMoves.subscribe(function (drags) {
      log.info("moves")
    })
*/


    /*mouseDowns.subscribe(function (down) {
      log.info("down")
    })

    mouseUps.subscribe(function (up) {
      log.info("ups")
    })

    mouseDrags.subscribe(function (drags) {
      log.info("drags",drags)
    })

    holds.subscribe(function (press) {
      log.info("longPress",press)
    })*/

    /*mouse_state.bufferWithTimeOrCount(600,2)
        .filter(isOneValue)
        .filter(function(x) { return (x[0] == true); })
        .onValue(log("hold"));
        

    holds.subscribe(function(hold){
      log.info("holds",hold)
    })*/

    /*moves.subscribe(function (move) {
      log.info("moves",move)
    })


    let clickStreamBase = clickStream
      .buffer(function() { return clickStream.throttle(multiClickDelay); })
      .map( list => list.length )
      .share();

    let singleClicks = clickStreamBase.filter( x => x == 1 );
    let multiClicks  = clickStreamBase.filter( x => x >= 2 );

    
    //let clicksNoUp = clickStreamBase.takeUntil(mouseUps);
   
    singleClicks.subscribe(function (event) {
        log.info( 'click' );
    });
    multiClicks.subscribe(function (numclicks) {
        log.info( numclicks+'x click');
    });
    Rx.Observable.merge(singleClicks, multiClicks)
        .debounce(1000)
        .subscribe(function (suggestion) {
    });*/

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