import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent
let just      = Observable.just
let merge     = Observable.merge

import {safeJSONParse, toArray} from '../../utils/utils'
import assign from 'fast.js/object/assign'//faster object.assign
import {pick} from 'ramda'

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
    //console.log("append",fieldName, value)
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

  const result =  Object.keys(input)
    .reduce(function(obj, key){
      if(key in mapping){
        obj[mapping[key]] = input[key]
      }
      else{
        obj[key] = input[key]
      }
      return obj
    },{})
  console.log("remapJson",result)
  return result
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
  //${bomId}
  const bomUri        = `${designUri}/boms${authTokenStr}`
  const partUri       = `${designUri}/parts${authTokenStr}`
  const assembliesUri = `${designUri}/assemblies/${assemblyId}${authTokenStr}`
  

  /*const rootUri    = undefined
  const designName = undefined

  const assembliesFileName = "assemblies.json"//"assemblies_old.json"//"assemblies-simple.json"//
  const bomFileName        = "bom.json"//"bom_old.json"//"bom.json"*/


  function youMagineStorageDriver(outgoing$){


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

        const bomFields = ['qty','phys_qty', 'unit', 'part_id' , 'part_parameters','part_version']

        const refined = pick( bomFields, remapJson(entry) )
        const data    = jsonToFormData(refined)

        return {
              url    :bomUri
            , method :'post'
            , send   : data
            , type   :'ymSave'
          }
      })
      console.log("request save bom",requests)
      return requests 
    }

    function toParts(partEntries){
      const fieldNames = ["id","name","description","uuid"]
    /*"binary_document_id": null,
    "binary_document_url": "",
    "source_document_id": null,
    "source_document_url": "",]*/

      const requests = bomEntries.map(function(entry){

        const data = jsonToFormData(entry)
        return {
              url    :partUri
            , method :'post'
            , data
            , type   :'ymSave'
          }
      })
      console.log("request save parts",requests)
      return requests 
    }

    outgoing$ = outgoing$.share()

    const bom$ = outgoing$.pluck("bom")
      .pluck("entries")
      .distinctUntilChanged()
      .filter(d=>d.length>0)
      .map(toBom)
      .flatMap(Rx.Observable.fromArray)

    const parts$ = outgoing$//.pluck("parts")
      .pluck("bom")
      .pluck("entries")
      .distinctUntilChanged()
      .filter(d=>d.length>0)
      .map(toParts)
      .flatMap(Rx.Observable.fromArray)

    const outToHttp$ = merge( bom$ )
    
    httpDriver(outToHttp$)
  }

  return youMagineStorageDriver
}