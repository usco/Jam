import Rx from 'rx'

let mainUri    = window.location.href 
let uriQuery   = getUriQuery(mainUri)
let designUri = fetchUriParams(mainUri, "designUrl").pop()
let meshUrli   = fetchUriParams(mainUri, "modelUrl").pop()
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
if(!designUri && ! meshUrli && !persistentUri && uriQuery)
{
  //FIXME: this does not seem right ...
  let apiDesignsUri = "https://jamapi.youmagine.com/api/v1/designs/"
  designUri = apiDesignsUri+uriQuery 
}

setDesignData$({uri:designUri})
loadDesign$(designUri)

//only load meshes if no designs need to be loaded 
meshUri$(meshUrls) //self.loadMesh(meshUrl) })
