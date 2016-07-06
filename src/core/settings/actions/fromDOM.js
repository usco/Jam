import Rx from 'rx'
const {merge} = Rx.Observable
import { keycodes, isValidElementEvent } from '../../../interactions/keyboard'

export default function intent (DOM, params) {
  // hack for firefox only as it does not correct get the "checked" value : note : this is not an issue in cycle.js
  let is_firefox_or_chrome = (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ||
    navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
  function checked (event) {
    // if(is_firefox_or_chrome) return ! event.target.checked
    return event.target.checked
  }

  const toggleShowGrid$ = DOM.select('.settingsView .showGrid').events('change').map(checked)
  const toggleShowAnnot$ = DOM.select('.settingsView .showAnnot').events('change').map(checked)
  const toggleAutoRotate$ = DOM.select('.settingsView .autoRotate').events('change').map(checked)
  const toggleFullScreen$ = DOM.select('.fullScreenToggler').events('click')

  const toggleSnapScaling$ = DOM.select('.menuContent .snapScaling').events('change').map(checked)
  const toggleUniformScaling$ = DOM.select('.menuContent .uniformScaling').events('change').map(checked)
  const toggleSnapRotation$ = DOM.select('.menuContent .snapRotation').events('change').map(checked)

  // const toggleAutoSelectNewEntities$ = Rx.Observable.just(true) //TODO: make settable
  // tools
  // const toggleRepeatTool$            = Rx.Observable.just(false) // does a tool gets stopped after a single use or not

  let keyUps$ = Rx.Observable.fromEvent(document, 'keyup') // DOM.select(":root").events("keyup")
    .filter(isValidElementEvent) // stop for input, select, and textarea etc
  const setActiveTool$ = merge(
    DOM.select('.toTranslateMode').events('click').map('translate'),
    DOM.select('.toRotateMode').events('click').map('rotate'),
    DOM.select('.toScaleMode').events('click').map('scale'),
    DOM.select('.toMirrorMode').events('click').map('mirror'),

    DOM.select('.addNote').events('click').map('addNote'),
    DOM.select('.measureDistance').events('click').map('measureDistance'),
    DOM.select('.measureDiameter').events('click').map('measureDiameter'),
    DOM.select('.measureThickness').events('click').map('measureThickness'),
    DOM.select('.measureAngle').events('click').map('measureAngle'),

    keyUps$.map(e => keycodes[e.keyCode]).filter(k => k === 'm').map('translate'),
    keyUps$.map(e => keycodes[e.keyCode]).filter(k => k === 't').map('translate'),
    keyUps$.map(e => keycodes[e.keyCode]).filter(k => k === 'r').map('rotate'),
    keyUps$.map(e => keycodes[e.keyCode]).filter(k => k === 's').map('scale')
  )
    .scan(function (acc, val) {
      console.log('acc', acc, val)
      if (acc === val && val !== undefined) {
        acc = undefined
      } else {
        acc = val
      }
      return acc
    })

  return {
    setActiveTool$,
    toggleAutoRotate$,
    toggleShowGrid$,
    toggleShowAnnot$,
    toggleSnapScaling$,
    toggleUniformScaling$,
    toggleSnapRotation$
  }
}
