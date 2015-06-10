import Rx from 'rx'

import {fetchUriParams,getUriQuery,setWindowPathAndTitle}  from '../utils/urlUtils'
import {setSetting$} from '../actions/appActions'
import {newDesign$, setDesignData$} from '../actions/designActions'


let mainUri    = window.location.href 
let uriQuery   = getUriQuery(mainUri)
let designUri = fetchUriParams(mainUri, "designUrl").pop()
let meshUri   = fetchUriParams(mainUri, "modelUrl").pop()
let appMode    = fetchUriParams(mainUri, "appMode").pop()

//let designUri$ = new Rx.Observable()
//let meshUri$   = new Rx.Observable()

import {exists} from '../utils/obsUtils'

//mesh sources : drag & drop 
//mesh URI source: drag & drop OR query param

//design sources: drag & drop OR remote
//design URI source: localstorage OR query param OR drag & drop 

//only allow if appMode is actually set
Rx.Observable
  .just(appMode)
  .filter(exists)
  .subscribe( setSetting$({path:"mode",value:appMode}) )

//load from localstorage in case all else failed

//last but not least, try to load if anything is in the query (shorthand for design uuids)
/*if(!designUri && ! meshUri && uriQuery)
{
  //FIXME: this does not seem right ...
  let apiDesignsUri = "https://jamapi.youmagine.com/api/v1/designs/"
  designUri = apiDesignsUri+uriQuery 
}

setDesignData$({uri:designUri})*/
//loadDesign$(designUri)

//only load meshes if no designs need to be loaded 
//meshUri$(meshUrls) //self.loadMesh(meshUrl) })



function getShortDesignUri (uriQuery){
  if(!uriQuery) return Rx.Observable.just(undefined)
  let apiDesignsUri = "https://jamapi.youmagine.com/api/v1/designs/"
  let designUri = apiDesignsUri+uriQuery
  return Rx.Observable.just( designUri )
}

let urDesignUri$ = Rx.Observable
  .just( designUri )
  .filter(exists)

let lsDesignUri$  = Rx.Observable
  .just(  localStorage.getItem("jam!-lastDesignUri") )
  .filter(exists)

let stDesignUri$ = Rx.Observable.merge(
  urDesignUri$,
  getShortDesignUri(uriQuery)
)
  .shareReplay(1)
  //.filter(exists)

let foo$ = Rx.Observable.merge(
  urDesignUri$,//ORDER MATTERS !!!
  lsDesignUri$,
  stDesignUri$
  )
  .take(1)
  .subscribe(
  function(data){
    console.log("HI THERE : mixed data source",data)
  })


