

export function normalizeWheel(event){
  let delta = {x:0,y:0}
  if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

      delta = event.wheelDelta;

  } else if ( event.detail ) { // Firefox older

      delta = - event.detail;

  }else if( event.deltaY ) { // Firefox
      
      delta = -event.deltaY;
  }

  return delta
}