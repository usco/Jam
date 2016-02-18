import Rx from 'rx'
const Observable= Rx.Observable
const {fromEvent, just, merge, concat} = Observable

import {combineLatestObj, replicateStream} from '../../utils/obsUtils'
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


function equals2(prev, cur){
  console.log("prev",prev,cur)

  const isEqual = equals(prev,cur)
  console.log("equals",isEqual)
  return isEqual
}

function upsert(http, params){
  //GET a resource
  //if 404 => POST
    //if error : retry until abort
  //else   => UPDATE
    //if error : retry until abort
  const {url} = params

  const outProxy$ = new Rx.ReplaySubject(1)

  const incoming$ = httpDriver(outToHttp$)

  replicateStream(currentSelections$, outProxy$)

  return {
        url    :`bomUri/${refined.part_id}${authTokenStr}`
      , method :'post'
      , send   
      , type   :'ymSave'
    }
}


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
  const bomUri        = `${designUri}/boms`
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

    function toBom(entries){
      const fieldNames = ['qty','phys_qty', 'unit', 'part_id' , 'part_parameters','part_version']
      const mapping = {
        'version':'part_version'
        ,'id':'part_uuid'
        ,'params':'part_parameters'
        ,'version':'part_version'
      }

      const requests = entries.map(function(entry){

        const refined = pick( fieldNames, remapJson(mapping, entry) )
        const send    = jsonToFormData(refined)

        return {
              url    :`bomUri/${refined.part_id}${authTokenStr}`
            , method :'put'
            , send   
            , type   :'ymSave'
          }
      })
      console.log("request save bom",requests)
      return requests 
    }

    function toParts(entries){
      const fieldNames = ['id','name','description','uuid']
      const mapping = {
        'id':'uuid'
        ,'params':'part_parameters'
      }
      /*"binary_document_id": null,
      "binary_document_url": "",
      "source_document_id": null,
      "source_document_url": "",]*/

      const requests = entries.map(function(entry){

        const refined = pick( fieldNames, remapJson(mapping, entry) )
        const send    = jsonToFormData(refined)

        return {
              url    : `partUri/${refined.uuid}${authTokenStr}`
            , method :'put'
            , send   
            , type   :'ymSave'
          }
      })
      return requests 
    }

    function dataFromItems(items){
      return Object.keys(items.transforms).reduce(function(list, key){
        const transforms = items['transforms'][key]
        const metadata   = items['metadata'][key]

        if(transforms && metadata){
          const entry = assign( {}, transforms, metadata)
          list.push(entry)
        }
        return list
      },[])
    }

    function toAssemblies(entries){
      console.log("entries",entries)

      const fieldNames = ['id','name','color','pos','rot','sca','typeUid']
      const mapping = {}
      const requests = entries.map(function(entry){

      const refined = pick( fieldNames, remapJson(mapping, entry) )
      const send    = jsonToFormData(refined)

        return {
              url    :assembliesUri
            , method :'put'
            , send   
            , type   :'ymSave'
          }
      })
      return requests 
    }

    //////////////////////////

    const save$ = outgoing$
      .debounce(50)//only save if last events were less than 50 ms appart
      .tap(e=>console.log("here",e))
      .filter(data=>data.method === 'save')
      .pluck('data')
      .share()
  
    const load$ = outgoing$
      .debounce(50)//only load if last events were less than 50 ms appart
      .tap(e=>console.log("here2",e))
      .filter(data=>data.method === 'load')
      .pluck('data')
      .share()

    ////
    const bom$ = save$.pluck("bom")
      .pluck("entries")
      .filter(d=>d.length>0)
      .distinctUntilChanged( null, equals )
      .map(toBom)
      .flatMap(Rx.Observable.fromArray)

    const parts$ = save$//.pluck("parts")
      .pluck("bom")
      .pluck("entries")
      .distinctUntilChanged( null, equals )
      .filter(d=>d.length>0)
      .map(toParts)
      .flatMap(Rx.Observable.fromArray)

    const assemblies$ = combineLatestObj({
          metadata:save$.pluck('eMetas')
        , transforms:save$.pluck('eTrans')
        , meshes: save$.pluck('eMeshs')})
      .debounce(1)
      .map(dataFromItems)
      .filter(d=>d.length>0)
      .map(toAssemblies)
      .flatMap(Rx.Observable.fromArray)
      .forEach(e=>console.log("item",e))


    const outToHttp$ = merge( parts$ )//concat(parts$,bom$) )
      .tap(e=>console.log("outToHttp",e))


    const inputs$ = httpDriver(outToHttp$)
    return inputs$    

    //to load data up again
    function fromAssemblies(entries){
      //for mesh components we require "parts" info
      //for meta components we require "assemblies" info
      //for tran components we require "assemblies" info
    }

  }

  return youMagineStorageDriver
}