import Rx from 'rx'
const Observable = Rx.Observable
const { just } = Observable
import { head } from 'ramda'


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

  let request = Rx.DOM.ajax({
    url: assembliesUri,
    crossDomain: true,
    async: true
  })
  return request
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
    .flatMap(getAssemblies)
    .pluck('response')
    .map(data => head(JSON.parse(data))) // 'head' => ie the first assembly we find
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
