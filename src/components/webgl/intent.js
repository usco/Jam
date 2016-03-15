import Rx from 'rx'
const {fromEvent,merge,combineLatest} = Rx.Observable

import {pointerInteractions,interactionsFromCEvents,preventScroll} from '../../interactions/pointers'
import {windowResizes,elementResizes} from '../../interactions/sizing'

import {preventDefault,isTextNotEmpty,formatData,exists,combineLatestObj} from '../../utils/obsUtils'
import {selectionAt,meshFrom,isTransformTool,targetObject} from './utils2'

import {toArray,itemsEqual} from '../../utils/utils'

import {getCoordsFromPosSizeRect} from './deps/Selector'


//get original data +  picking infos
function addPickingInfos( inStream$, containerResizes$, camera, scene ){
  return inStream$
    .withLatestFrom(
      containerResizes$,
      function(event, clientRect){
        if(event){
          let input = document.querySelector('.container')//canvas
          let clientRect = input.getBoundingClientRect()

          let data = {
            pos:{x:event.clientX,y:event.clientY}
            ,rect:clientRect,width:clientRect.width,height:clientRect.height
            ,event
          }
          let mouseCoords = getCoordsFromPosSizeRect(data)
          return selectionAt(event, mouseCoords, camera, scene.children)
        }
        else{
          return {}
        }
      }
    )
}

//extract the object & position from a pickingInfo data
function objectAndPosition(pickingInfo){
  return {object:pickingInfo.object,point:pickingInfo.point}
}


export default function intent(sources, data){
  let {DOM} = sources
  let {camera, scene, transformControls} = data

  const windowResizes$ = windowResizes(1) //get from intents/interactions ?
  const elementResizes$ = elementResizes(".container",1)

  const {shortSingleTaps$,
    shortDoubleTaps$,
    longTaps$,
    zooms$,
    dragMoves$} = pointerInteractions(interactionsFromCEvents(DOM))

  //FIXME : needs to be done in a more coherent, reusable way
  //shut down "wobble effect if ANY user interaction takes place"
  const userAction$ = merge(
    shortSingleTaps$,
    shortDoubleTaps$,
    longTaps$,
    zooms$,
    dragMoves$
  )//.subscribe(e=>wobble.stop())

  //Prevent contextmenu for all of the gl canvas FIXME: side effect ?
  DOM.select('canvas').events('contextmenu').subscribe( e => preventDefault(e) )

  //stream of container resize events
  const containerResizes$ = windowResizes$
    .map(function(){
      let input = document.querySelector('.container')//canvas
      if(input) return input.getBoundingClientRect()
    })
    .filter(exists)
    .startWith({width:window.innerWidth, height:window.innerHeight, aspect:window.innerWidth/window.innerHeight, bRect:undefined})

  //are the transform controls active : ie we are dragging, rotating, scaling an object
  const tControlsActive$ = merge(
    fromEvent(transformControls,"mouseDown").map(true),
    fromEvent(transformControls,"mouseUp").map(false)
  ).startWith(false)
  //.tap(e=>console.log( "transform controls active",e ))

  const shortSingleTapsWPicking$ = addPickingInfos(shortSingleTaps$, windowResizes$, camera, scene)
    .shareReplay(1)
  const shortDoubleTapsWPicking$ = addPickingInfos(shortDoubleTaps$, windowResizes$, camera, scene)
    .shareReplay(1)
  const longTapsWPicking$          = addPickingInfos(longTaps$, windowResizes$, camera, scene)
    .withLatestFrom(tControlsActive$,function(longTaps, tCActive){//disable long taps in case we are manipulating an object
      if(longTaps) return undefined
      return dragMoves
    })
    .filter(exists)
    .shareReplay(1)

  //contextmenu observable should return undifined when any other basic interaction
  //took place (to cancel displaying context menu , etc)
  /*longTapsWPicking$ = longTapsWPicking$
    .merge(
      shortSingleTapsWPicking$.map(undefined),
      shortDoubleTapsWPicking$.map(undefined),
      dragMoves$.map(undefined)
    )*/

  //zoom action intent
  const zoomInOnPoint$ = shortDoubleTapsWPicking$
    .map(e => e.detail.pickingInfos.shift())
    .filter(exists)
    .map( objectAndPosition )

  const zoomToFit$ = Rx.Observable.just(true) //DOM.select('#zoomToFit').events("click")

  //Stream of selected meshes
  const selectMeshes$ = merge(
      shortSingleTapsWPicking$.map( meshFrom )
      ,longTapsWPicking$.map( meshFrom )
    )
    .map(toArray)//important !! consumers expect arrays
    //.distinctUntilChanged()
    .shareReplay(1)

  //if transformControls are active
  // filter out dragMove gestures: ie prevent camera from moving/rotating
  let fDragMoves$ = dragMoves$
    .withLatestFrom(tControlsActive$,function(dragMoves,tCActive){
      if(tCActive) return undefined
      return dragMoves
    })
    .filter(exists)

  //actual stream used for camera controls: dragMove gestures + zoom gestures
  let filteredInteractions$ = {dragMoves$:fDragMoves$, zooms$}

  //stream of transformations done on the current selection
  const selectionsTransforms$ = fromEvent(transformControls, 'objectChange')
    .map(targetObject)
    .map(function(t){
      return {
        pos:t.position.toArray().slice(0,3),
        rot:t.rotation.toArray().slice(0,3),
        sca:t.scale.toArray().slice(0,3)
      }
    })

  return {
    userAction$
    , zoomInOnPoint$
    , zoomToFit$
    , selectMeshes$

    ,shortSingleTapsWPicking$
    ,shortDoubleTapsWPicking$
    ,longTapsWPicking$

    ,filteredInteractions$

    ,selectionsTransforms$
  }
}
