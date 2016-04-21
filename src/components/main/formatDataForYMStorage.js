import Rx from 'rx'
const {merge, just} = Rx.Observable
import { equals, contains, head } from 'ramda'
import { exists } from '../../utils/utils'
import { combineLatestObj } from '../../utils/obsUtils'

export default function formatDataForYMStorage ({sources, state$}) {
  const apiEndpoint$ = sources.addressbar.get('apiEndpoint')
    .map(head)
    .filter(exists)
    .shareReplay(1)

  // this are responses from ym
  const waitForLoadNeeded$ = state$.pluck('settings', 'autoLoad') // do we need to wait for data to be loaded?
    .map(data => !data)

  const loadAllDone$ = sources.ym
    .filter(res$ => res$.request.type === 'ymLoad') // handle errors etc
    .flatMap(data => {
      const responseWrapper$ = data.catch(e => {
        console.log('caught error in loading data', e)
        return Rx.Observable.empty()
      })
      const request$ = just(data.request)
      const response$ = responseWrapper$.pluck('response')
      return combineLatestObj({response$, request$}) // .materialize()//FIXME: still do not get this one
    })
    .scan(function (acc, data) {
      acc.push(data.request.typeDetail)
      return acc
    }, [])
    .map(function (data) {
      // TODO: we need a way to check what the design actually has
      // we recieved all 3 types of data, we are gold !
      return (contains('parts', data) && contains('bom', data) && contains('assemblyEntries', data))
    })
    .merge(waitForLoadNeeded$) // here we combine with autoLoad/autoSave settings : if autoLoad is false but autoSave is true, just save
    .filter(d => d === true)
    .tap(e => console.log('loading done, we got it all'))

  const designExists$ = sources.ym
    .tap(e => console.log('responses from ym', e))
    .filter(res => res.request.method === 'get' && res.request.type === 'ymLoad' && res.request.typeDetail === 'designExists')
    .flatMap(data => data.catch(_ => just({error: true}))) // flag errors
    .filter(e => !e.progress) // filter out progress data
    .map(data => data.error ? false : true) // if we have an error return false, true otherwise
    // .forEach(e=>console.log("designExists: ",e))

  // OUTPUT to ym
  const bomToYm = state$.pluck('bom')
  const entityMetaToYm = state$.pluck('meta')
  const entityTransformsToYm = state$.pluck('transforms')
  const entitymeshesToYm = state$.pluck('meshes')
  const parts = state$.pluck('types')
  const design = state$.pluck('design')
  const authData = state$.pluck('authData')
  const assembly = state$.pluck('assembly')

  // send simple query to determine if design already exists
  const queryDesignExists$ = combineLatestObj({design, authData, apiEndpoint$})
    .filter(data => data.authData.token !== undefined && data.design.synched) // only try to save anything when the design is in "synch mode" aka has a ur
    .map(data => ({data, query: 'designExists'}))
    .take(1)

  // saving should NOT take place before load is complete IFAND ONLY IF , we are reloading a design
  const saveDesigntoYm$ = state$
    .filter(state => state.settings.autoSave === true) // do not save anything if not in save mode
    .filter(state => state.design.synched && state.authData.token !== undefined) // only try to save anything when the design is in "synch mode" aka has a ur
    .skipUntil(loadAllDone$)
    //.tap(e => console.log('we are all done loading so SAVE', e))
    .flatMap(_ => combineLatestObj({
      bom: bomToYm,
      parts,
      eMetas: entityMetaToYm,
      eTrans: entityTransformsToYm,
      eMeshs: entitymeshesToYm,
      design,
      authData,
      assembly,

      apiEndpoint$})
  )
    .map(function (data) {
      return {method: 'save', data, type: 'design'}
    })
    .distinctUntilChanged(null, equals)

  // if the design exists, load data, otherwise...whataver
  const loadDesignFromYm$ = designExists$ // actions.loadDesign
    .withLatestFrom(state$.pluck('settings', 'autoLoad'), function (designExists, autoLoad) {
      return designExists && autoLoad
    })
    .filter(e => e === true) // filter out non existing designs (we cannot load those , duh')
    .flatMap(_ => combineLatestObj({design, authData, apiEndpoint$})) // we inject design & authData
    .map(data => ({method: 'load', data, type: 'design'})) // create our query/request
    .throttle(5)
    .distinctUntilChanged(null, equals)
    .take(1)
    .tap(e => console.log('loadDesignFromYm', e))

  const ymStorage$ = merge(queryDesignExists$, saveDesigntoYm$, loadDesignFromYm$)
    .distinctUntilChanged(null, equals)

  return ymStorage$
}
