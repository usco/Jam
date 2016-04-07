import Rx from 'rx'
const of = Rx.Observable.of
import { combineLatestObj } from '../utils/obsUtils'

import Detector from '../components/webgl/deps/Detector.js'

// source driver
export default function browserCapsDriver () {
  return combineLatestObj({
    webglEnabled: of(Detector.webgl)
  })
}
