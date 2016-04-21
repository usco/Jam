import Rx from 'rx'
const Observable = Rx.Observable
const { merge, just } = Observable

import { combineLatestObj } from '../../utils/obsUtils'
import { exists } from '../../utils/utils'
import { changesFromObservableArrays } from '../../utils/diffPatchUtils'

import assign from 'fast.js/object/assign' // faster object.assign
import {equals} from 'ramda'

import {makeApiStream, spreadRequests} from './helpers'
import {toParts, toBom, toAssemblies, dataFromItems} from './saveHelpers'
import {getParts, getBom, getAssemblyEntries, makeApiStreamGets, makeGetStreamForAssemblies,
 getAssemblyEntriesNoAssemblyFound, otherHelper} from './loadHelpers'

////////////////
// actual driver stuff
// storage driver for YouMagine designs & data etc
export default function makeYMDriver (httpDriver, params = {}) {
  const defaults = {
    apiBaseUri: 'api.youmagine.com/v1',
    urlBase: 'https'
  }
  params = assign({}, defaults, params)
  let { apiBaseUri, urlBase } = params
  const apiEndpoint = `${urlBase}://${apiBaseUri}`

  function youMagineStorageDriver (outgoing$) {
    // ////////////////////////
    // deal with designInfos
    const designInfos$ = outgoing$
      .filter(data => data.query === 'designExists')
      .pluck('data')
      .share()

    const apiEndpoint$ = outgoing$.pluck('data','apiEndpoint')
        .startWith(apiEndpoint)
        .filter(exists)
        .shareReplay(1)

    const designExistsRequest$ = combineLatestObj({
      design: designInfos$.pluck('design'),
      authData: designInfos$.pluck('authData'),
      apiEndpoint$
    })
      .map(({design, authData, apiEndpoint}) => ({designId: design.id, authToken: authData.token, apiEndpoint}))
      .map(function (data) {
        const {designId, authToken} = data
        const authTokenStr = `/?auth_token=${authToken}`
        const designUri = `${apiEndpoint}/designs/${designId}${authTokenStr}`
        return {
          url: designUri,
          method: 'get',
          type: 'ymLoad',
          typeDetail: 'designExists'
        }
      })

    // all that is needed for save & load
    // deal with saving
    const save$ = outgoing$
      .debounce(50) // only save if last events were less than 50 ms appart
      .filter(data => data.method === 'save')
      .pluck('data')
      .share()

    const design$ = save$
      .pluck('design')
    const authData$ = save$
      .pluck('authData')

    // deal wiht loading basics
    const load$ = outgoing$
      .debounce(50) // only load if last events were less than 50 ms appart
      .filter(data => data.method === 'load')
      .pluck('data')
      .share()

    const lDesign$ = load$
      .pluck('design')

    const lAuthData$ = load$
      .pluck('authData')

    // saving stuff
    const dataDebounceRate = 20 // debounce rate (in ms) for the input RAW data , affects the rate of request GENERATION, not of outbound requests
    const requestDebounceRate = 500 // time in ms between each emited http request : ie don't spam the api !

    const bom$ = changesFromObservableArrays(
      save$.pluck('bom')
        .distinctUntilChanged(null, equals)
        .debounce(dataDebounceRate)
    )

    const parts$ = changesFromObservableArrays(
      save$.pluck('bom')
        .distinctUntilChanged(null, equals)
        .debounce(dataDebounceRate)
    )

    const assemblies$ = changesFromObservableArrays(
      combineLatestObj({
        metadata: save$.pluck('eMetas'),
        transforms: save$.pluck('eTrans'),
        meshes: save$.pluck('eMeshs')
      })
        .debounce(dataDebounceRate)
        .filter(exists)
        .map(dataFromItems)
    )

    //requests sent out to the server for CUD operations
    const partsOut$ = makeApiStream(parts$, toParts, design$, authData$, apiEndpoint$)
    const bomOut$ = makeApiStream(bom$, toBom, design$, authData$, apiEndpoint$)
    const assemblyOut$ = makeApiStream(assemblies$, toAssemblies, design$, authData$, apiEndpoint$)

    //requests sent out to the server for Read operations
    const partsIn$ = makeApiStreamGets(load$, getParts, lDesign$, lAuthData$, apiEndpoint$)
    const bomIn$ = makeApiStreamGets(load$, getBom, lDesign$, lAuthData$, apiEndpoint$)
    const assembliesIn$ = makeGetStreamForAssemblies(load$, null, lDesign$, lAuthData$, apiEndpoint$)
    const assemblyEntriesIn$ = makeApiStreamGets(otherHelper(httpDriver(assembliesIn$)), getAssemblyEntries, lDesign$, lAuthData$, apiEndpoint$)

    // Finally put it all together
    const allSaveRequests$ = spreadRequests(requestDebounceRate, merge(partsOut$, bomOut$, assemblyOut$))
    const allLoadRequests$ = merge(partsIn$, bomIn$, assemblyEntriesIn$)

    //and send them on their way
    const outToHttp$ = merge(designExistsRequest$, allSaveRequests$, allLoadRequests$)
      //.tap(e => console.log('requests out to http', e))

    const inputs$ = httpDriver(outToHttp$)
      .merge(getAssemblyEntriesNoAssemblyFound(assembliesIn$))

    // starts when outputing data, done when confirmation recieved
    function confirmSaveDone(what){
      const confirmation$ = inputs$
        .filter(r => r.request)
        .filter(res$ => res$.request.type === 'ymSave') // handle errors etc
        .flatMap(data => {
          const responseWrapper$ = data.catch(e => {
            return Rx.Observable.empty()
          })
          const request$ = just(data.request)
          const response$ = responseWrapper$.pluck('response')
          return combineLatestObj({response$, request$}) // .materialize()//FIXME: still do not get this one
        })
        .map(data => data.request.typeDetail)
        .filter(data => data === what)
        .tap(e => console.log('saving done'))
      return confirmation$
    }

    function computeSaveProgress (outObs$, what) {
      return outObs$.map(_ => true)
        .merge(confirmSaveDone(what).map(_ => false))
    }

    const saveInProgressParts$ = computeSaveProgress(partsOut$, 'parts')
    const saveInProgressBom$ = computeSaveProgress(bomOut$, 'bom')
    const saveInProgressAssembly$ = computeSaveProgress(assemblyOut$, 'assemblies')
    const saveInProgress$ = merge(saveInProgressParts$, saveInProgressBom$, saveInProgressAssembly$)
      .tap(e=>console.log('saveInProgress', e))
      .map(data => ({saveInProgress: data}))

    return {
      data: inputs$,
      progress: saveInProgress$
    }
  }

  return youMagineStorageDriver
}
