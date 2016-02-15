import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent
let just      = Observable.just

import {safeJSONParse, toArray} from '../../utils/utils'
import assign from 'fast.js/object/assign'//faster object.assign


function jsonToFormData(jsonData){
  jsonData = JSON.parse( JSON.stringify( jsonData ) )
  let formData = new FormData()
  for(let fieldName in jsonData){
    let value = jsonData[fieldName]
    //value = encodeURIComponent(JSON.stringify(value))
    //value = JSON.stringify(value)
    //value = value.replace(/\"/g, '')
    if(Object.prototype.toString.call(value) === "[object Object]"){
      value = JSON.stringify(value)
    }
    if(Object.prototype.toString.call(value) === "[object Array]"){
      value = JSON.stringify(value)
    }
    console.log("append",fieldName, value)
    formData.append(fieldName, value)
  }
  return formData
}

function remapJson(input){
  const mapping = {
    'version':'part_version'
    ,'id':'part_id'
    ,'params':'part_parameters'
    ,'version':'part_version'
  }

}

      /*
      "qty": null,
  "phys_qty": null,
  "unit": null,
  "part_id": null,
  "part_parameters": null,
  "part_version": null,
  "design_id": 9962,*/

        /*id: "DE993D53-2B7D-4D72-B495-53DBC8529F60"
        name: "UM2CableChain_BedEnd"
        printable: true
        qty: 1
        unit: "QA"
        version: "0.0.1"*/



//storage driver for YouMagine designs & data etc
export default function makeYMDriver(httpDriver, params={}){
  const defaults = {
    apiBaseProdUri:'api.youmagine.com/v1'
    ,apiBaseTestUri:''
    ,urlBase:'https'

    ,designId:undefined

    ,testMode:true
    ,login:undefined
    ,password:undefined
  }
  params = assign({},defaults,params)


  let { apiBaseProdUri, apiBaseTestUri, urlBase, testMode, login, password} = params

  let apiBaseUri = testMode !== undefined ? apiBaseTestUri : apiBaseProdUri
  let authData   = (login !== undefined && password!==undefined) ? (`${login}:${password}@`) : ''


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

    function toBom(bomEntries){
      const requests = bomEntries.map(function(entry){

        const data = jsonToFormData(entry)
        return assign(
          {
              part_id: entry.id
            , url:bomUri
            , method:'post'
            , data
            , type:'ymSave'

          }, entry)
      })


      /*
      "qty": null,
  "phys_qty": null,
  "unit": null,
  "part_id": null,
  "part_parameters": null,
  "part_version": null,
  "design_id": 9962,*/

        /*id: "DE993D53-2B7D-4D72-B495-53DBC8529F60"
        name: "UM2CableChain_BedEnd"
        printable: true
        qty: 1
        unit: "QA"
        version: "0.0.1"*/

      
      console.log("toBom",requests)
    }

    outgoing$ = outgoing$.share()
    const bom$ = outgoing$.pluck("bom")
      .pluck("entries")
      .distinctUntilChanged()


    bom$
      .forEach(toBom)
   
    outgoing$
      //.tap(e=>console.log("output to youMagineStorageDriver",e))
      .distinctUntilChanged()
      .subscribe(formatOutput)
    

    return {
      get: getItem
      ,set: setItem
      ,remove: remove
    }
  }


  return youMagineStorageDriver
}