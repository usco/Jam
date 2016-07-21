import Rx from 'rx'
const {fromEvent, merge} = Rx.Observable

import { pointerInteractions, interactionsFromCEvents } from '../../interactions/pointers'
import { windowResizes, elementResizes } from '../../interactions/sizing'

import { preventDefault, formatData, exists } from '../../utils/obsUtils'
import { selectionAt, meshFrom, targetObject } from './utils2'

import { toArray } from '../../utils/utils'

import { getCoordsFromPosSizeRect } from './deps/Selector'

import { pluck, head, values } from 'ramda'


// get original data +  picking infos
function addPickingInfos (inStream$, containerResizes$, camera, scene) {
  return inStream$
    .withLatestFrom(
      containerResizes$,
      function (event, clientRect) {
        if (event) {
          let input = document.querySelector('.container') // canvas
          let clientRect = input.getBoundingClientRect()

          let data = {
            pos: {
              x: event.clientX,
              y: event.clientY},
            rect: clientRect,
            width: clientRect.width,
            height: clientRect.height,
            event}
          let mouseCoords = getCoordsFromPosSizeRect(data)
          return selectionAt(event, mouseCoords, camera, scene.children)
        } else {
          return {}
        }
      }
  )
}

// extract the object & position from a pickingInfo data
function objectAndPosition (pickingInfo) {
  return {object: pickingInfo.object, point: pickingInfo.point}
}

export default function intent (sources, data) {
  let {DOM} = sources
  let {camera, scene, transformControls, props$, settings$} = data

  const windowResizes$ = windowResizes(1) // get from intents/interactions ?
  const elementResizes$ = elementResizes('.container', 1)

  const {shortSingleTaps$, shortDoubleTaps$, longTaps$, zooms$, dragMoves$} = pointerInteractions(interactionsFromCEvents(DOM))

  // FIXME : needs to be done in a more coherent, reusable way
  // shut down "wobble effect if ANY user interaction takes place"
  const userAction$ = merge(
    shortSingleTaps$,
    shortDoubleTaps$,
    longTaps$,
    zooms$,
    dragMoves$
  ) // .subscribe(e=>wobble.stop())

  // Prevent contextmenu for all of the gl canvas FIXME: side effect ?
  DOM.select('canvas').events('contextmenu').subscribe(e => preventDefault(e))

  // stream of container resize events
  const containerResizes$ = windowResizes$
    .map(function () {
      let input = document.querySelector('.container') // canvas
      if (input) return input.getBoundingClientRect()
    })
    .filter(exists)
    .startWith({width: window.innerWidth, height: window.innerHeight, aspect: window.innerWidth / window.innerHeight, bRect: undefined})

  // are the transform controls active : ie we are dragging, rotating, scaling an object
  const tControlsActive$ = merge(
    fromEvent(transformControls, 'mouseDown').map(true),
    fromEvent(transformControls, 'mouseUp').map(false)
  ).startWith(false)
  // .tap(e=>console.log( "transform controls active",e ))

  const shortSingleTapsWPicking$ = addPickingInfos(shortSingleTaps$, windowResizes$, camera, scene)
    .shareReplay(1)
  const shortDoubleTapsWPicking$ = addPickingInfos(shortDoubleTaps$, windowResizes$, camera, scene)
    .shareReplay(1)
  const longTapsWPicking$ = addPickingInfos(longTaps$, windowResizes$, camera, scene)
    .withLatestFrom(tControlsActive$, function (longTaps, tCActive) { // disable long taps in case we are manipulating an object
      if (tCActive) return undefined
      return longTaps
    })
    .filter(exists)
    .shareReplay(1)

  // contextmenu observable should return undifined when any other basic interaction
    // took place (to cancel displaying context menu , etc)
    /* longTapsWPicking$ = longTapsWPicking$
      .merge(
        shortSingleTapsWPicking$.map(undefined),
        shortDoubleTapsWPicking$.map(undefined),
        dragMoves$.map(undefined)
      )*/

  // zoom action intent
  const zoomInOnPoint$ = shortDoubleTapsWPicking$
    .map(e => e.detail.pickingInfos.shift())
    .filter(exists)
    .map(objectAndPosition)

  const zoomToFit$ = Rx.Observable.just(true) // DOM.select('#zoomToFit').events("click")

  // Stream of selected meshes
  const selectMeshes$ = merge(
    shortSingleTapsWPicking$.map(meshFrom)
    , longTapsWPicking$.map(meshFrom)
  )
    .map(toArray) // important !! consumers expect arrays
    // .distinctUntilChanged()
    .shareReplay(1)

  // if transformControls are active
  // filter out dragMove gestures: ie prevent camera from moving/rotating
  let fDragMoves$ = dragMoves$
    .withLatestFrom(tControlsActive$, function (dragMoves, tCActive) {
      if (tCActive) return undefined
      return dragMoves
    })
    .filter(exists)

  // actual stream used for camera controls: dragMove gestures + zoom gestures
  let filteredInteractions$ = {dragMoves$: fDragMoves$, zooms$}


  const selections$ = props$.pluck('selections').startWith([]).filter(exists).distinctUntilChanged()
    .map(x => x.map(y => y.id))// we just need the ids
  const transforms$ = props$.pluck('meshes')//.withLatestFrom(selections$,function(transforms, selections))
  const activeTool$ = settings$.pluck('activeTool').startWith(undefined).distinctUntilChanged()


  // stream of transformations done on the current selection
  const selectionsTransforms$ = fromEvent(transformControls, 'objectChange')
    //.tap(e=>console.log('sdfsdf',e))
    .map(targetObject)
    .withLatestFrom(selections$, activeTool$, transforms$, function (t, selections, activeTool, _transforms) {
      const transform = {'translate': 'pos', 'rotate': 'rot', 'scale': 'sca'}[activeTool]

      /*FIXME: horrid, we have to deal with transforms on the meshes (horrors of OOP  & mutability)
      //FIXME: also we need to do this whole thing since only ONE object is actually transformed
      by transformcontrols, so we first compute the average of all mesh positions, then we get the
      position of the updated position, do a difference between the avg & modified one, and add it to the changed value
      HORRIBLY Convoluted, but will not be the case anymore with regl/functional opengl/webgl
      */
      function valueMap(mesh, transform){
        const mapper = {
        pos: mesh.position.toArray().slice(0, 3),
        rot: mesh.rotation.toArray().slice(0, 3),
        sca: mesh.scale.toArray().slice(0, 3).map((val,index) => (mesh.flipped && mesh.flipped[index] === 1) ? val * -1: val)//to handle negative scaling/mirrored data, as the transformControls always return values >0
        }
        return mapper[transform]
      }

      //FIXME : only needed if data storage is a hash
      _transforms = selections
        .map((input) => _transforms[input]) // get only needed ones
        .map(function (mesh) {
          let res = {}
          res[transform] = valueMap(mesh, transform)
          return res
        })

      const avg = pluck(transform)(_transforms)
        .reduce(function (acc, cur) {
          if(!acc) return cur
          return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
        }, undefined)

      const tranformedValue = valueMap(t, transform)
      const diff = [avg[0] - tranformedValue[0], avg[1] - tranformedValue[1], avg[2] - tranformedValue[2]]
      const value = [ diff[0] + tranformedValue[0], diff[1] + tranformedValue[1], diff[2] + tranformedValue[2]]

      //const realValue =
      return {value, trans: transform, ids: selections}
    })
    .map(function (data) { // format data so that we have an array of changes, by id
      const {value, trans, ids} = data
      return ids.map(function (id) {
        return {value: value, trans, id}
      })
    })

  return {
    userAction$,
    zoomInOnPoint$,
    zoomToFit$,
    selectMeshes$,
    shortSingleTapsWPicking$,
    shortDoubleTapsWPicking$,
    longTapsWPicking$,
    filteredInteractions$,
    selectionsTransforms$}
}
