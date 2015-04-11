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

 let mouseMovesAlt = mouseMoves
      .bufferWithCount(2)
      .flatMap( function(data){
        let [a,b] = data;
        return  Observable.return({
            client:{x: a.clientX,y: a.clientY },
            delta:{x: a.clientX - b.clientX,y: a.clientY - b.clientY}});
      });