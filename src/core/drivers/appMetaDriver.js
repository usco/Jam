import Rx from 'rx'

export default function appMetaDataDriver(){
  let pjson = require('../../../package.json')
  let appMetadata$ = Rx.Observable.just({
    name: pjson.name,
    version:pjson.version 
  })
  return appMetadata$
}

