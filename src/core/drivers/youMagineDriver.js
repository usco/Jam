import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent
let just      = Observable.just

import {safeJSONParse, toArray} from '../../utils/utils'
import assign from 'fast.js/object/assign'//faster object.assign

//storage driver for YouMagine designs & data etc


export default function makeYMDriver(httpDriver, params){
  const defaults = {
    ,apiBaseProdUri:'api.youmagine.com/v1'
    ,apiBaseTestUri:''
    ,urlBase:'https'

    
    ,designId:undefined

    ,testMode:undefined
    ,login:undefined
    ,password:undefined
  }
  params = assign({},defaults,params)


  let { apiBaseProdUri, apiBaseTestUri, urlBase, testMode, login, password} = params

  let apiBaseUri = testMode !== undefined ? apiBaseTestUri : apiBaseProdUri
  let authData   = (login !== undefined && password!==undefined) ? (`${login}:${password}@`) : ''
  let apiBaseUri = testMode !== undefined ? apiBaseTestUri : apiBaseProdUri


  const authToken  = ""
  
  const designId   = 0
  const bomId      = 0
  const assemblyId = 0

  const authTokenStr = `/?auth_token=${authToken}`

  const designUri = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`

  //const documentsUri = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}/documents/${params.documentId}${authTokenStr}`

  const bomUri        = `${designUri}/boms/${bomId}${authTokenStr}`
  const assembliesUri = `${designUri}/assemblies/${assemblyId}${authTokenStr}`
  

  /*const rootUri    = undefined
  const designName = undefined

  const assembliesFileName = "assemblies.json"//"assemblies_old.json"//"assemblies-simple.json"//
  const bomFileName        = "bom.json"//"bom_old.json"//"bom.json"*/


  function youMagineStorageDriver(outgoing$){
    function formatOutput(){
    }

    function getItem(item){
      return just( {} ).map(safeJSONParse)
    }

    function setItem(key, value){
      //return localStorage.setItem(key,value)
    }

    function remove(item){
      //removeItem(item)
    }

    function toBom(){
      
    }

   
    if(outgoing$){
      outgoing$
        .tap(e=>console.log("output to youMagineStorageDriver",e))

        .distinctUntilChanged()
        .subscribe(formatOutput)
    } 

    return {
      get: getItem
      ,set: setItem
      ,remove: remove
    }
  }


  return youMagineStorageDriver
}