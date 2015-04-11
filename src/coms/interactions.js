

var csp = require("js-csp");
let {chan, go, take, put, putAsync, alts, timeout, buffers} = require("js-csp");
var xducers = require("transducers.js");


export let fromDomEvent=function(el, type, bufSize=buffers.sliding(1), xform) {
  var ch = chan(bufSize, xform);
  el.addEventListener(type, function(e) {
    putAsync(ch, e);
  });
  return ch;
}

/*function fromEvent(element, eventName) {
  let ch = chan(buffers.sliding(1));
  element.addEventListener(eventName, function(event) {
    putAsync(ch, event);
  });
  return ch;
}*/


export let bufferWithTimeOrCount=function(inChan, time, count){
  let inBuf = [];
  let ch = chan();
  let idx = 0;

  go(function*() {
     while(true) {
      var result = yield alts([inChan,timeout(time) ]);
      if(result && result.value){
        inBuf.push( result.value )
        idx++;
      }
      else{
        if(idx!=0)
        {
          idx=0;
          csp.putAsync(ch, inBuf);
          inBuf = [];
        }
      }
      if(idx == count){
        console.log("ending at count")
        idx=0;
        csp.putAsync(ch, inBuf);
        inBuf = [];
      }
    }
  });
  return ch;
}


 //window resize channel
 export let windowSize=function()
 {
  let windowSizeCh = fromDomEvent(window, 'resize');
  //only get the fields we need
  let extractSize = function(x){ 
    let x = x.target;
    let res = {width:x.innerWidth, height:x.innerHeight, aspect:x.innerWidth/x.innerHeight} 
    return res;
  }
  //let curryTest = curryRight(_.pick)('innerWidth')('innerHeight')
  pipeline(windowSizeCh, xducers.map( extractSize ), windowSizeCh);
  return windowSizeCh;
 }



export let MouseDrags=function(mouseDowns, mouseUps, mouseMoves){

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
  return mouseDrags;
}


/*go(function*() {
  while(true) {
    var result = yield windowSizeCh;
    console.log("windowSize",result)
  }
});*/


/*go(function*() {
    var clickch = listen(trackerEl, 'click');
    var bufferedClicksCh  = bufferWithTimeOrCount(clickch, 250, 2)

    var testCh = csp.chan();
    var xform = xducers.filter(isOneValue);

    // Notice that we're keeping `toCh` open after `fromCh` is closed
    csp.operations.pipeline(testCh, xform, bufferedClicksCh, true);

    while(true) {
      var result = yield testCh;
      console.log("AAAAAAAA",result)//if(result.value) 
    }
  });*/

//let isOneValue  = function( x ) { return (x.length == 2); }
//let isTwoValues = function( x ) { return (x.length == 1); }


/*go(function*() {
var clickch = listen(trackerEl, 'click');
var testCh  = bufferWithTimeOrCount(clickch,200,2);
while(true) {
  var result = yield testCh//alts([outCh ,timeout(200) ]);
  console.log("AAAAAAAA",result)//if(result.value) 
}
});*/


    /*go(function*() {
      var mousech = listen(trackerEl, 'mousemove');
   
      var clickch = listen(trackerEl, 'click');
      var mousePos = [0, 0];
      var clickPos = [0, 0];

      while(true) {
        var v = yield alts([mousech, clickch,timeout(500) ]);
        var e = v.value;
        let moved = false;//TODO: use a transducer to determine movement? ie diffs in position


        switch( v.channel ){
          case mousech:
            mousePos = [e.layerX || e.clientX, e.layerY || e.clientY];
          break;
          case clickch:
            clickPos = [e.layerX || e.clientX, e.layerY || e.clientY];
          break;
          case upch:
            console.log("mouse up");
          break;
          case downch:
            console.log("mouse down");
          break;
          default:
            //, timeout(500)
            console.log("duh, waitin'")
          break;
        }

        outputEl.innerHTML = (mousePos[0] + ', ' + mousePos[1] + ' — ' +
                        clickPos[0] + ', ' + clickPos[1]);
      }
    });
    */


    /*
    let mouseUps    = fromDomEvent(trackerEl, 'mouseup');
    let mouseDowns  = fromDomEvent(trackerEl, 'mousedown');
    let mouseMoves  = fromDomEvent(trackerEl, 'mousemove');

    function coordinate(event, canvas) {
        let rect = canvas.getBoundingClientRect();

        let coords={
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        }
        console.log(coords)
        return coords
      }

   let mouseDrags = MouseDrags(mouseDowns, mouseUps, mouseMoves);
      // Saving to firebase 
      go(function*() {
        for (;;) {
          let drag = yield mouseDrags;
          //console.log("drag",drag)
          go(function*() {
            let color = "blue";//document.getElementById("color").value || "blue";
            //let _dragref = _ref.push({color: color});
            let event;
            while (csp.CLOSED !== (event = yield drag)) {
              console.log("drag indeed")
              //_dragref.ref().child("points").push(coordinate(event, canvas));
            }
          });
        }
      });

      */