 /*cspMouseTrack(trackerEl, outputEl){

    let trackerEl = this.refs.wrapper.getDOMNode();
    let outputEl  = this.refs.infoLayer.getDOMNode();

    function listen(el, type, bufSize) {
      var ch = chan(bufSize);
      el.addEventListener(type, function(e) {
        csp.putAsync(ch, e);
      });
      return ch;
    }*/

    /*go(function*() {
      var mousech = listen(trackerEl, 'mousemove');
      var clickch = listen(trackerEl, 'click');
      let clicks = 0;

      while(true) {
        var result = yield alts([clickch,timeout(200) ]);
        var value = result.value;
        if(value)
        {
          console.log("test",result);
          clicks++;
        }else{

          clicks=0;
        }

        if(clicks == 2)
        {
          outputEl.innerHTML = ("double clicks:");
        }else if(clicks == 1){
          outputEl.innerHTML = ("single click");
        }
      }
    });*/
    /*var outCh = csp.chan(1, xducers.partition(2));
    csp.operations.pipe(listen(trackerEl, 'click'), outCh, true);
    //csp.operations.pipeline(outCh, xducers.partition(2), listen(trackerEl, 'click'), true);

    go(function*() {
      //var clickch = listen(trackerEl, 'click');
      while(true) {
        var result = yield alts([outCh ,timeout(200) ]);
        console.log("AAAAAAAA",result)//if(result.value) 
      }
    });*/


    /*go(function*() {
      var mousech = listen(trackerEl, 'mousemove');
      //var upch    = listen(trackerEl, 'mouseup');
      //var downch  = listen(trackerEl, 'mousedown');
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