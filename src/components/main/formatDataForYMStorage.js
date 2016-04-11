import Rx from 'rx'
const {merge, just} = Rx.Observable
import { equals } from 'ramda'
import { combineLatestObj } from '../../utils/obsUtils'

export default function formatDataForYMStorage ({sources, state$}) {
  // this are responses from ym
  const designExists$ = sources.ym
    // .tap(e=>console.log("responses from ym",e))
    .filter(res => res.request.method === 'get' && res.request.type === 'ymLoad' && res.request.typeDetail === 'designExists')
    .flatMap(data => data.catch(_ => just({error: true}))) // flag errors
    .filter(e => !e.progress) // filter out progress data
    .map(data => data.error ? false : true) // if we have an error return false, true otherwise
    // .forEach(e=>console.log("designExists: ",e))

  // output to ym
  const bomToYm = state$.pluck('bom')
  const entityMetaToYm = state$.pluck('meta')
  const entityTransformsToYm = state$.pluck('transforms')
  const entitymeshesToYm = state$.pluck('meshes')
  const parts = state$.pluck('types')
  const design = state$.pluck('design')
  const authData = state$.pluck('authData')
  const assembly = state$.pluck('assembly')

  // simple query to determine if design already exists
  const queryDesignExists$ = combineLatestObj({design, authData})
    .filter(data => data.authData.token !== undefined && data.design.synched) // only try to save anything when the design is in "synch mode" aka has a ur
    .map(data => ({data, query: 'designExists'}))
    .take(1)

  // saving should NOT take place before load is complete IFAND ONLY IF , we are reloading a design
  const saveDesigntoYm$ = state$
    .filter(state => state.settings.saveMode === true) // do not save anything if not in save mode
    .filter(state => state.design.synched && state.authData.token !== undefined) // only try to save anything when the design is in "synch mode" aka has a ur
    // skipUntil(designLoaded)
    .flatMap(_ => combineLatestObj({
      bom: bomToYm,
      parts,
      eMetas: entityMetaToYm,
      eTrans: entityTransformsToYm,
      eMeshs: entitymeshesToYm,
      design,
      authData,
      assembly})
  )
    .map(function (data) {
      return {method: 'save', data, type: 'design'}
    })
    .distinctUntilChanged(null, equals)

  // if the design exists, load data, otherwise...whataver
  const loadDesignFromYm$ = designExists$ // actions.loadDesign
    .withLatestFrom(state$.pluck('settings', 'saveMode'), function (designExists, saveMode) {
      return designExists && !saveMode
    })
    .filter(e => e === true) // filter out non existing designs (we cannot load those , duh')
    .flatMap(_ => combineLatestObj({design, authData})) // we inject design & authData
    .map(data => ({method: 'load', data, type: 'design'})) // create our query/request
    .throttle(5)
    .distinctUntilChanged(null, equals)
    .take(1)
    .tap(e => console.log('loadDesignFromYm', e))

  const ymStorage$ = merge(queryDesignExists$, saveDesigntoYm$, loadDesignFromYm$)
    .distinctUntilChanged(null, equals)

  return ymStorage$
}
