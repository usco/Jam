import Firebase from 'firebase'
import React from 'react';


var csp = require("js-csp");
let {chan, go, take, put,putAsync, alts, timeout, buffers} = require("js-csp");
import {bufferWithTimeOrCount, fromDomEvent, MouseDrags} from '../coms/interactions'

var xducers = require("transducers.js");
var seq = xducers.seq
var transduce = xducers.transduce
var reduce    = xducers.reduce

let pipeline = csp.operations.pipeline;
let merge    = csp.operations.merge;


export default class App extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidMount(){
    console.log("TESTIN' CSP")
    let trackerEl = this.refs.drawCanvas.getDOMNode();
    let canvas = trackerEl;
    let _ref = new Firebase("https://boiling-heat-275.firebaseio.com/");

    let mouseDowns  = fromDomEvent(canvas, 'mousedown');
    let mouseUps    = fromDomEvent(document, 'mouseup');
    let mouseMoves  = fromDomEvent(canvas, 'mousemove');

    function coordinate(event, canvas) {
      let rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }

    let mouseDrags = chan(8);
    /* Generating drags */
    go(function*() {
      for (;;) {
        let event = yield mouseDowns;
        let drag = chan(8);
        yield put(drag, event);
        putAsync(mouseDrags, drag);
        let r;
        while (mouseMoves === (r = yield alts([mouseMoves, mouseUps])).channel) {
          event = r.value;
          yield put(drag, event);
        }
        drag.close();
      }
    });
    
    /* Saving to firebase */
    go(function*() {
      for (;;) {
        let drag = yield mouseDrags;
        go(function*() {
          let color = "blue";
          let _dragref = _ref.push({color: color});
          let event;
          while (csp.CLOSED !== (event = yield drag)) {
            _dragref.ref().child("points").push(coordinate(event, canvas));
          }
        });
      }
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