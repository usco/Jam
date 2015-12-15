import Rx from 'rx'

export default function appMetaDataDriver(){
  let pjson = require('../../../package.json')
  let appMetadata$ = Rx.Observable.of({
    version:pjson.version 
  })
  return appMetadata$
}

