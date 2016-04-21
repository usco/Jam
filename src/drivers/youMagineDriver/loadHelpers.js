import Rx from 'rx'
const Observable = Rx.Observable
const { just } = Observable
import { head } from 'ramda'
import { combineLatestObj } from '../../utils/obsUtils'



export function makeApiStreamGets (source$, outputMapper, design$, authData$, apiEndpoint$) {
  const get$ = source$
    .withLatestFrom(design$, authData$, apiEndpoint$, (sourceData, design, authData, apiEndpoint) => ({sourceData, designId: design.id, authToken: authData.token, apiEndpoint}))
    .map(outputMapper)

  return get$
}

// ///////All of these create requests from input data
export function getBom (data) {
  const {designId, authToken, apiEndpoint} = data

  const authTokenStr = `/?auth_token=${authToken}`
  const designUri = `${apiEndpoint}/designs/${designId}`
  const bomUri = `${designUri}/bom${authTokenStr}`

  return {
    url: bomUri,
    method: 'get',
    type: 'ymLoad',
    typeDetail: 'bom',
    responseType: 'json'
  }
}

export function getParts (data) {
  const {designId, authToken, apiEndpoint} = data

  const authTokenStr = `/?auth_token=${authToken}`
  const designUri = `${apiEndpoint}/designs/${designId}`
  const partUri = `${designUri}/parts${authTokenStr}`

  return {
    url: partUri,
    method: 'get',
    type: 'ymLoad',
    typeDetail: 'parts',
    responseType: 'json'
  }
}

export function getAssemblies (data) { // FIXME: semi hack
  const {designId, authToken, apiEndpoint} = data

  const authTokenStr = `/?auth_token=${authToken}`
  const designUri = `${apiEndpoint}/designs/${designId}`
  const assembliesUri = `${designUri}/assemblies${authTokenStr}`

  /*let request = Rx.DOM.ajax({// FIXME: swap out for something else
    url: assembliesUri,
    crossDomain: true,
    async: true
  })
  return request*/

  return {
    url: assembliesUri,
    method: 'get',
    type: 'ymLoad',
    typeDetail: 'assemblies',
    responseType: 'json'
  }

}

export function getAssemblyEntries (data) {
  const {designId, authToken, sourceData, apiEndpoint} = data

  const authTokenStr = `/?auth_token=${authToken}`
  const designUri = `${apiEndpoint}/designs/${designId}`
  const assembliesUri = `${designUri}/assemblies/${sourceData.uuid}/entries${authTokenStr}`

  return {
    url: assembliesUri,
    method: 'get',
    type: 'ymLoad',
    typeDetail: 'assemblyEntries',
    responseType: 'json',
    assemblyId: sourceData.uuid// FIXME : temporary, used to know WHICH assembly the further data belongs to
  }
}

export function makeGetStreamForAssemblies (source$, outputMapper, design$, authData$, apiEndpoint$){
  return source$
    .withLatestFrom(design$, authData$, apiEndpoint$, (_, design, authData, apiEndpoint) => ({designId: design.id, authToken: authData.token, apiEndpoint}))
    .map(getAssemblies)
    /*.flatMap(getAssemblies)
    .pluck('response')
    .map(data => head(JSON.parse(data))) // 'head' => ie the first assembly we find*/
}

export function getAssemblyEntriesNoAssemblyFound(getAssemblies$){
  return getAssemblies$
    .filter(data => data === undefined)
    .map(function (_) {
      let result = just({
        response: []
      })
      result.request = {type: 'ymLoad', typeDetail: 'assemblyEntries'}
      return result
    })
}

export function otherHelper(source$){
  return source$
    .filter(d => d.request)
    .filter(res$ => res$.request.type === 'ymLoad' && res$.request.typeDetail === 'assemblies') // handle errors etc
    .flatMap(data => {
      const responseWrapper$ = data.catch(e => {
        return Rx.Observable.empty()
      })
      const request$ = just(data.request)
      const response$ = responseWrapper$.pluck('response')
      return combineLatestObj({response$, request$}) // .materialize()//FIXME: still do not get this one
    })
    .pluck('response')
    .map(head)
}

// TODO : experiment with reuseable boilerplate for responses
function reqWithCheck(source$, valid){

  function valid (req){
    req.type === 'ymLoad' && req.typeDetail === 'assemblies'
  }

  return source$
    .filter(d => d.request)
    .filter(function (res$) {
      return valid(res$.request)
      //res$ => res$.request.type === 'ymLoad' && res$.request.typeDetail === 'assemblies'
    }) // handle errors etc
    .flatMap(data => {
      const responseWrapper$ = data.catch(e => {
        return Rx.Observable.empty()
      })
      const request$ = just(data.request)
      const response$ = responseWrapper$.pluck('response')
      return combineLatestObj({response$, request$}) // .materialize()//FIXME: still do not get this one
    })
}
