import Rx from 'rx'
import combineTemplate from 'rx.observable.combinetemplate'

import Detector from '../../components/webgl/deps/Detector.js'

//source driver 
export default function browserCapsDriver(){

  return combineTemplate({
    webglEnabled: Rx.Observable.just(Detector.webgl)
  })
}