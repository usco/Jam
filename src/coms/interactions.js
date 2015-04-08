

var csp = require("js-csp");
let {chan, go, take, put, alts, timeout} = require("js-csp");
var xducers = require("transducers.js");


export let fromDomEvent=function(el, type, bufSize, xform) {
  var ch = chan(bufSize, xform);
  el.addEventListener(type, function(e) {
    csp.putAsync(ch, e);
  });
  return ch;
}


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