import Rx from 'rx'
const Observable= Rx.Observable
const {fromEvent, just, merge, concat} = Observable

import {safeJSONParse, toArray} from '../../utils/utils'
import assign from 'fast.js/object/assign'//faster object.assign
import {pick, equals} from 'ramda'

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

function remapJson(mapping, input){
  

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
      const fieldNames = ['qty','phys_qty', 'unit', 'part_id' , 'part_parameters','part_version']
      const mapping = {
        'version':'part_version'
        ,'id':'part_id'
        ,'params':'part_parameters'
        ,'version':'part_version'
      }

      const requests = bomEntries.map(function(entry){

        const refined = pick( fieldNames, remapJson(mapping, entry) )
        const send    = jsonToFormData(refined)

        return {
              url    :bomUri
            , method :'post'
            , send   
            , type   :'ymSave'
          }
      })
      console.log("request save bom",requests)
      return requests 
    }

    function toParts(partEntries){
      const fieldNames = ['id','name','description','uuid']
      const mapping = {
        'id':'uuid'
        ,'params':'part_parameters'
      }
      /*"binary_document_id": null,
      "binary_document_url": "",
      "source_document_id": null,
      "source_document_url": "",]*/

      const requests = partEntries.map(function(entry){

        const refined = pick( fieldNames, remapJson(mapping, entry) )
        const send    = jsonToFormData(refined)
        console.log("entry", entry, refined)

        return {
              url    :partUri
            , method :'post'
            , send   
            , type   :'ymSave'
          }
      })
      console.log("request save parts",requests)
      return requests 
    }

    outgoing$ = outgoing$.share()

    const bom$ = outgoing$.pluck("bom")
      .pluck("entries")
      .filter(d=>d.length>0)
      .distinctUntilChanged(null, equals )
      .map(toBom)
      .flatMap(Rx.Observable.fromArray)




    const parts$ = outgoing$//.pluck("parts")
      .pluck("bom")
      .pluck("entries")
      .distinctUntilChanged(null, equals )
      .filter(d=>d.length>0)
      .map(toParts)
      .flatMap(Rx.Observable.fromArray)
      


    const outToHttp$ = merge( concat(parts$,bom$) )
      //.forEach(e=>console.log("outToHttp",e))
    httpDriver(outToHttp$)
  }

  return youMagineStorageDriver
}