import {combineLatestObj} from './obsUtils'


export function clearCursor(element=document.body){
  element.style.cursor = 'default' 
}

//ui utils
export function toggleCursor(toggle, cursorName, element=document.body){
  if(toggle)
  {
    element.style.cursor = cursorName
  }else{
    element.style.cursor = 'default'
  }
  return toggle
}

export function getXY(e){
  var posx = 0;
  var posy = 0;
  if (!e) var e = window.event;
  if (e.pageX || e.pageY)     {
      posx = e.pageX;
      posy = e.pageY;
  }
  else if (e.clientX || e.clientY)     {
      posx = e.clientX + document.body.scrollLeft
          + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop
          + document.documentElement.scrollTop;
  }
  // posx and posy contain the mouse position relative to the document
  // Do something with this information
  let {x,y} = getOffset(e.target)

  return {  x:x+posx, y:y+posy }
}

/*from http://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element#answer-442474*/
export function getOffset( el ) {
  var el2 = el;
  var curtop = 0;
  var curleft = 0;
  if (document.getElementById || document.all) {
      do  {
          curleft += el.offsetLeft-el.scrollLeft;
          curtop += el.offsetTop-el.scrollTop;
          el = el.offsetParent;
          el2 = el2.parentNode;
          while (el2 != el) {
              curleft -= el2.scrollLeft;
              curtop -= el2.scrollTop;
              el2 = el2.parentNode;
          }
      } while (el.offsetParent);

  } else if (document.layers) {
      curtop += el.y;
      curleft += el.x;
  }
    return { top: curtop, left: curleft, x:curleft, y:curtop }
}

/*prepare observables for rendering , by extracting the DOM object*/
export function prepForRender(params, suffix)
{
  suffix = suffix || "Ui"

  const DOMS = Object.keys(params)
    .reduce(function(prev,cur){
      let key = cur.replace(suffix,"")
      if("DOM" in params[cur]){
        prev[key] = params[cur].DOM
      }else{
        prev[key] = params[cur]
      }
      return prev
    },{})
  return combineLatestObj(DOMS)
}
