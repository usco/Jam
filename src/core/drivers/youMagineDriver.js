import Rx from 'rx'
const Observable= Rx.Observable
const {fromEvent, fromArray, just, merge, concat, concatAll} = Observable

import {combineLatestObj, replicateStream} from '../../utils/obsUtils'
import {safeJSONParse, toArray, remapJson} from '../../utils/utils'
import {changesFromObservableArrays} from '../../utils/diffPatchUtils'

import assign from 'fast.js/object/assign'//faster object.assign
import {pick, equals, head, pluck} from 'ramda'

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
      // console.log("value",value)
    }
    if(Object.prototype.toString.call(value) === "[object Array]"){
      //value = //JSON.stringify(value)
      //value = 'arr[]', arr[i]//value.reduce()
      //console.log("value",value)
      value = `{ ${value.join(',')} }`
    }

    //console.log("append",fieldName, value)
    formData.append(fieldName, value)

  }
  //throw new Error("fpp")
  return formData
}

function makeApiStream(source$, outputMapper, design$, authData$){
  const upsert$  = source$
    .map(d=>d.upserted)
    .withLatestFrom(design$, authData$,(_entries,design,authData)=>({_entries,designId:design.id,authToken:authData.token}))
    .map(outputMapper.bind(null,'put'))
    .flatMap(fromArray)

  const delete$ = source$
    .map(d=>d.removed)
    .withLatestFrom(design$, authData$,(_entries,design,authData)=>({_entries,designId:design.id,authToken:authData.token}))
    .map(outputMapper.bind(null,'delete'))
    .flatMap(fromArray)

  return merge(upsert$, delete$)
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

  function youMagineStorageDriver(outgoing$){

    function toParts(method='put', data){
      const {designId, authToken} = data
      const entries   = data._entries || []

      const authTokenStr = `/?auth_token=${authToken}`
      const designUri  = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`
      const partUri    = `${designUri}/parts`

      const fieldNames = ['id','name','description','uuid']
      const mapping = {
        'id':'uuid'
        ,'params':'part_parameters'
      }
      /*"binary_document_id": null,
      "binary_document_url": "",
      "source_document_id": null,
      "source_document_url": "",]*/
      const requests = entries
        .map(function(entry){

        const refined = pick( fieldNames, remapJson(mapping, entry) )
        const send    = jsonToFormData(refined)

        return {
              url    : `${partUri}/${refined.uuid}${authTokenStr}`
            , method
            , send
            , type   :'ymSave'
            , typeDetail:'parts'
            , mimeType: null//'application/json'
            , responseType: 'json'
          }
      })
      return requests
    }

    function toBom(method='put', data){
      const {designId, authToken} = data
      const entries   = data._entries || []

      const authTokenStr = `/?auth_token=${authToken}`
      const designUri     = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`
      const bomUri    = `${designUri}/bom`

      const fieldNames = ['qty','phys_qty', 'unit', 'part_uuid' , 'part_parameters','part_version']
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
              url    :`${bomUri}/${refined.part_uuid}${authTokenStr}`
            , method
            , send
            , type   :'ymSave'
            , typeDetail:'bom'
            , mimeType: null//'application/json'
            , responseType: 'json'
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

    function toAssemblies(method='put', data){
      const {designId, authToken} = data
      const entries   = data._entries || []

      const assemblyId = head( pluck('assemblyId',entries) )//head(entries).assemblyId

      const authTokenStr  = `/?auth_token=${authToken}`
      const designUri     = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`
      const assembliesUri = `${designUri}/assemblies/${assemblyId}/entries`

      const fieldNames = ['uuid','name','color','pos','rot','sca','part_uuid']
      const mapping = {'id':'uuid', 'typeUid':'part_uuid'}
      const requests = entries.map(function(entry){

      const refined = pick( fieldNames, remapJson(mapping, entry) )
      const send    = jsonToFormData(refined)

        return {
              url    : `${assembliesUri}/${refined.uuid}${authTokenStr}`
            , method
            , send
            , type   :'ymSave'
            , typeDetail :'assemblies'
          }
      })
      return requests
    }

    //////////////////////////
    //deal with designInfos
    const designInfos$ = outgoing$
      .filter(data=>data.query==="designExists")
      .pluck('data')
      .share()

    const designExistsRequest$ = combineLatestObj({
        design   :designInfos$.pluck('design')
        ,authData:designInfos$.pluck('authData')
      })
      .map(({design,authData})=>({designId:design.id,authToken:authData.token}))
      .map(function(data){
        const {designId, authToken} = data
        const authTokenStr = `/?auth_token=${authToken}`
        const designUri     = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}${authTokenStr}`
        return {
              url    : designUri
            , method : 'get'
            , type   :'ymLoad'
            , typeDetail :'designExists'
          }
      })
      //.tap(e=>console.log("designExistsRequest",e))

    //////////
    //deal with saving
    const save$ = outgoing$
      .debounce(50)//only save if last events were less than 50 ms appart
      .filter(data=>data.method === 'save')
      .pluck('data')
      .share()

    const design$ = save$
      .pluck('design')
    const authData$ = save$
      .pluck('authData')
    const assembly$ = save$
      .pluck('assembly')

    const load$ = outgoing$
      .debounce(50)//only load if last events were less than 50 ms appart
      .filter(data=>data.method === 'load')
      .pluck('data')
      .share()

    const lDesign$ = load$
      .pluck('design')
    const lAuthData$ = load$
      .pluck('authData')

    const getBom$ = load$
      .withLatestFrom(lDesign$,lAuthData$,(_,design,authData)=>({designId:design.id,authToken:authData.token}))
      .map(function(data){
        const {designId, authToken} = data

        const authTokenStr = `/?auth_token=${authToken}`
        const designUri     = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`
        const bomUri    = `${designUri}/bom${authTokenStr}`

        return {
            url    : bomUri
          , method : 'get'
          , type   :'ymLoad'
          , typeDetail:'bom'
          , responseType:'json'
        }
      })

    const getParts$ = load$
      .withLatestFrom(lDesign$,lAuthData$,(_,design,authData)=>({designId:design.id,authToken:authData.token}))
      .map(function(data){
        const {designId, authToken} = data

        const authTokenStr = `/?auth_token=${authToken}`
        const designUri     = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`
        const partUri    = `${designUri}/parts${authTokenStr}`

        return {
            url    : partUri
          , method : 'get'
          , type   :'ymLoad'
          , typeDetail:'parts'
          , responseType:'json'
        }
      })

    const getAssemblies$ = load$
      .withLatestFrom(lDesign$,lAuthData$,(_,design,authData)=>({designId:design.id,authToken:authData.token}))
      .flatMap(function(data){//FIXME: semi hack
        const {designId, authToken} = data

        const authTokenStr  = `/?auth_token=${authToken}`
        const designUri     = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`
        const assembliesUri = `${designUri}/assemblies${authTokenStr}`

        let request = Rx.DOM.ajax({
          url: assembliesUri,
          crossDomain: true,
          async: true
        })
        return request
      })
      .pluck('response')
      .map(function(data){
        return head(JSON.parse(data))
      })
      .withLatestFrom(lDesign$,lAuthData$,(assemblyData, design,authData)=>({assemblyData,designId:design.id,authToken:authData.token}))
      .map(function(data){
        const {designId, authToken, assemblyData} = data

        const authTokenStr  = `/?auth_token=${authToken}`
        const designUri     = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`
        const assembliesUri = `${designUri}/assemblies/${assemblyData.uuid}/entries${authTokenStr}`

        return {
            url    : assembliesUri
          , method : 'get'
          , type   :'ymLoad'
          , typeDetail:'assemblyEntries'
          , responseType:'json'
        }
      })
      //.tap(e=>console.log("data",e))
        /*function (data) {
          data.response.forEach(function (product) {
            console.log(product);
          });
        },
        function (error) {
          // Log the error
        }
      )*/


    /*const getAssemblies$ = load$
      .withLatestFrom(lDesign$,lAuthData$,(_,design,authData)=>({designId:design.id,authToken:authData.token}))

      .map(function(data){
        const {designId, authToken} = data

        const authTokenStr  = `/?auth_token=${authToken}`
        const designUri     = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`
        const assembliesUri = `${designUri}/assemblies${authTokenStr}`

        return {
            url    : assembliesUri
          , method : 'get'
          , type   :'ymLoad'
          , typeDetail:'assemblies'
          , responseType:'json'
        }
      })

      const getAssemblyEntries$ = load$
        .withLatestFrom(lDesign$,lAuthData$,(_,design,authData)=>({designId:design.id,authToken:authData.token}))
        //FIXME: semi hack
        .combineLatest()
        .map(function(data){
          const {designId, authToken} = data

          const authTokenStr  = `/?auth_token=${authToken}`
          const designUri     = `${urlBase}://${authData}${apiBaseUri}/designs/${designId}`
          const assembliesUri = `${designUri}/assemblies${authTokenStr}`

          return {
              url    : assembliesUri
            , method : 'get'
            , type   :'ymLoad'
            , typeDetail:'assemblyEntry'
            , responseType:'json'
          }
        })*/

      /*const makeAssembliesEntry$ =
        .withLatestFrom(design$,authData$,(_entries,design,authData)=>({_entries,designId:design.id,authToken:authData.token}))
        .map(toBom.bind(null,'put'))*/


    //saving stuff
    ////
    const bom$ = changesFromObservableArrays(
      save$.pluck("bom")
        .distinctUntilChanged( null, equals )
    )

    const parts$ = changesFromObservableArrays(
      save$.pluck("bom")
        .distinctUntilChanged( null, equals )
    )

    const assemblies$ = changesFromObservableArrays(
      combineLatestObj({
          metadata:save$.pluck('eMetas')
        , transforms:save$.pluck('eTrans')
        , meshes: save$.pluck('eMeshs')})
      .debounce(1)
      .map(dataFromItems)
    )

    const partsOut$    = makeApiStream(parts$, toParts, design$, authData$)
    const bomOut$      = makeApiStream(bom$  , toBom, design$, authData$)
    const assemblyOut$ = makeApiStream(assemblies$ ,toAssemblies, design$, authData$)

    //Finally put it all together
    const allSaveRequests$ = merge(partsOut$, bomOut$, assemblyOut$).debounce(20)//don't spam the api !
    const allLoadRequests$ = merge(getParts$, getBom$, getAssemblies$)

    const outToHttp$ = merge(designExistsRequest$, allSaveRequests$, allLoadRequests$)
      //.tap(e=>console.log("outToHttp",e))

    const inputs$ = httpDriver(outToHttp$)

    const saveResponses$ = inputs$
      .filter(res$ => res$.request.type === 'ymSave')//handle errors etc
      .flatMap(data => {
        const responseWrapper$ = data.catch(e=>{
          console.log("caught error in saving data",e)
          return Rx.Observable.empty()
        })
        const request$  = just(data.request)
        const response$ = responseWrapper$.pluck("response")

        return combineLatestObj({response$, request$})//.materialize()//FIXME: still do not get this one
      })
      .forEach(e=>console.log("saving done (if all went well)"))

    return inputs$
  }

  return youMagineStorageDriver
}
