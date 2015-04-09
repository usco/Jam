var Rx = require('rx');
let fromEvent = Rx.Observable.fromEvent;
import Firebase from 'firebase'
import React from 'react';


export default class App extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidMount(){
    console.log("TESTIN' RX")

    let trackerEl = this.refs.drawCanvas.getDOMNode();
    let canvas = trackerEl;
    let _ref = new Firebase("https://boiling-heat-275.firebaseio.com/");

    let mouseDowns  = fromEvent(canvas, 'mousedown');
    let mouseUps    = fromEvent(document, 'mouseup');
    let mouseMoves  = fromEvent(canvas, 'mousemove');

    function getOffset(event) {
      return {
        x: event.offsetX === undefined ? event.layerX : event.offsetX,
        y: event.offsetY === undefined ? event.layerY : event.offsetY
      };
    }

    let mouseDrags = mouseDowns.select(function (downEvent) {
        return mouseMoves.takeUntil(mouseUps).select(function (drag) {
            return getOffset(drag);
        });
    });

    mouseDrags.subscribe(function (drags) {
        let colour = "blue";
        var _dragref = _ref.push({colour: colour});
        drags.subscribe(function (move) {
            _dragref.ref().child('points').push({x: move.x, y: move.y});
        });
    });
  }

  render(){
    let canvasStyle= {
      position: 'absolute',
      right: 0,
      bottom: 0,
      background: 'red',
      width:'300px',
      height:'300px',
      zIndex:25
    };
    return (
        <div ref="wrapper">
          <div style={canvasStyle}>
            <canvas ref="drawCanvas"> </canvas>
          </div>
        </div>
    );
  }
}

export default App
