import Rx from 'rx'

import {fetchUriParams,getUriQuery,setWindowPathAndTitle}  from '../../utils/urlUtils'
import {exists} from '../../utils/obsUtils'

let mainUri    = window.location.href 
let uriQuery   = getUriQuery(mainUri)
let designUri = fetchUriParams(mainUri, "designUrl").pop()
let meshUris   = fetchUriParams(mainUri, "modelUrl")
let appMode    = fetchUriParams(mainUri, "appMode").pop()


//mesh sources : drag & drop 
//mesh URI source: drag & drop OR query param

//design sources: drag & drop OR remote
//design URI source: localstorage OR query param OR drag & drop 

//only allow if appMode is actually set
let appMode$ = Rx.Observable
  .just(appMode)
  .filter(exists)
  //.subscribe( setSetting$({path:"mode",value:appMode}) )

//load from localstorage in case all else failed

//let name = localStorage.getItem("jam!-lastDesignName") || undefined
//let uri  = localStorage.getItem("jam!-lastDesignUri") || undefined


let settings$ = Rx.Observable.just(
  JSON.parse( localStorage.getItem("jam!-settings")  )
)




//on second thought, that does not fit, as it merges the results back together
function inParallel (items){
  return Rx.Observable
    .for(items, function (item) {
        return Rx.Observable.just(item)
    })
}

function getShortDesignUri (uriQuery){
  if(!uriQuery) return Rx.Observable.just(undefined)
  let apiDesignsUri = "https://jamapi.youmagine.com/api/v1/designs/"
  let designUri = apiDesignsUri+uriQuery
  return Rx.Observable.just( designUri )
}

//query param
let urDesignUri$ = Rx.Observable
  .just( designUri )
  .filter(exists)
  .shareReplay(1)

//local storage
let lsDesignUri$  = Rx.Observable
  .just(  localStorage.getItem("jam!-lastDesignUri") )
  .filter(exists)
  .shareReplay(1)

//only load meshes if no designs need to be loaded 
let meshUris$ = inParallel(meshUris)//Rx.Observable.just(meshUris.pop()) //
  //.takeUntil(urDesignUri$.merge(lsDesignUri$))
  .filter(exists)

//only attempt to load from short uid as last resort
//last but not least, try to load if anything is in the query (shorthand for design uuids)
let stDesignUri$ = Rx.Observable.merge(
  urDesignUri$,
  getShortDesignUri(uriQuery)
)
  .takeUntil(meshUris$)
  .shareReplay(1)
  .filter(exists)


let designUri$ = Rx.Observable.merge(
  urDesignUri$,//ORDER MATTERS !!!
  lsDesignUri$
  //stDesignUri$
  )
  .take(1)
 

export {designUri$,meshUris$,settings$, appMode$}
