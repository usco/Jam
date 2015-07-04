import Rx from 'rx'
import combineTemplate from 'rx.observable.combinetemplate'

import Detector from './components/webgl/deps/Detector.js'




export default function browserCaps(){

  let webglEnabled$ = Rx.Observable.just(Detector.webgl)

  return combineTemplate({
    webglEnabled$
  })
}