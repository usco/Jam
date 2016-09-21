import Rx from 'rx'

import { combineLatestObj, replicateStream } from '../../utils/obsUtils'
import { toArray } from '../../utils/utils'

import {extractChanges} from '../../utils/diffPatchUtils'

// entity components
import { makeMetaSystem } from '../../core/entities/components/meta'
import { makeTransformsSystem } from '../../core/entities/components/transforms'
import { makeMeshSystem } from '../../core/entities/components/mesh'
import { makeBoundingSystem } from '../../core/entities/components/bounds'

import { addAnnotation } from '../../core/entities/annotations/annotations'

import { remapEntityActions, remapMetaActions, remapMeshActions, remapTransformActions, remapBoundsActions } from '../../core/entities/utils'

import selectionsIntents from '../../core/selections/intents'

import design from '../../core/design/design'
import auth from '../../core/auth/auth.js'
import settings from '../../core/settings/settings'

import comments from '../../core/comments/comments'
import selections from '../../core/selections/selections'

import entityTypes from '../../core/entities/types'
import assembly from '../../core/entities/assemblies'
import makeTypeInstanceMapping from '../../core/entities/typeInstanceMapping'
import entitiesExtra from '../../core/entities/entitiesExtra'
import bom from '../../core/bom/index'
import bomIntents from '../../core/bom/intents'

export default function model (props$, actions, sources) {
  let entityActions = actions.entityActions

  const design$ = design(actions.designActions)
  const authData$ = auth(actions.authActions) // authentification data, if any
  const settings$ = settings(actions.settingActions)

  const types$ = entityTypes(actions.entityActions)
  const assembly$ = assembly(actions.entityActions).pluck('currentAssembly')
  const comments$ = comments(actions.commentActions)

  const {createMeshComponents$, componentBase$} = entitiesExtra(actions, types$, assembly$)
  entityActions.createMeshComponents$ = createMeshComponents$

  // annotations
  let addAnnotations$ = addAnnotation(actions.annotationsActions, settings$)
    .map(toArray)

  const proxySelections$ = new Rx.ReplaySubject(1)

  entityActions = remapEntityActions(entityActions, proxySelections$)
  console.log('entityActions', entityActions)

  const metaActions = remapMetaActions(entityActions, componentBase$, proxySelections$, addAnnotations$)
  const meshActions = remapMeshActions(entityActions, componentBase$)
  const transformActions = remapTransformActions(entityActions, componentBase$, settings$)
  const boundActions = remapBoundsActions(entityActions, componentBase$, settings$)

  const {meta$} = makeMetaSystem(metaActions)
  const {meshes$} = makeMeshSystem(meshActions)
  const {transforms$} = makeTransformsSystem(transformActions)
  const {bounds$} = makeBoundingSystem(boundActions)
  const entityComponents$ = combineLatestObj({
    meta$,
    transforms$,
    meshes$,
    types$,
    bounds$
  })

  const entityAdded$ = meta$.distinctUntilChanged()
    .map(x=>Object.keys(x))
    .scan(function (acc, x) {
      let cur = x
      let prev = acc.cur
      return {cur, prev}
    }, {prev: undefined, cur: undefined})
    .map(function (typeData) {
      let {cur, prev} = typeData
      return extractChanges(prev, cur)
    })
    .pluck('added')
    .forEach(e=>console.log('changes to meta',e))

  // selections => only for real time view
  const typesInstancesRegistry$ = makeTypeInstanceMapping(meta$, types$)
  const selections$ = selections(selectionsIntents(sources,
    {idsMapper$: typesInstancesRegistry$, removeInstances$: entityActions.deleteInstances$, removeTypes$: entityActions.removeTypes$}))
    //.merge(entityActions.deleteInstances$.map(a => ({instIds: [], bomIds: []}))) // after an instance is removed, unselect

  const currentSelections$ = selections$
    .withLatestFrom(typesInstancesRegistry$, function (selections, registry) {
      return selections.instIds.map(function (id) {
        const typeUid = registry.typeUidFromInstUid[id]
        return {id, typeUid}
      })
    })
    .distinctUntilChanged()
    .shareReplay(1)

  // close some cycles
  replicateStream(currentSelections$, proxySelections$)

  //FIXME : must find a way to get it out of here
  const bomActions = bomIntents(sources, types$, metaActions, entityActions)
  const bom$ = bom(bomActions)

  //saveNotifications
  const saveNotifications$ = sources.ym.progress
    .pluck('saveInProgress')
    .filter(d => d === true)
    .flatMap(function(data){
      return Rx.Observable.just(data).merge(Rx.Observable.timer(300).map(false))
    })

  // not entirely sure, we need a way to observe any fetch/updload etc operation
  const operationsInProgress$ = actions.progress.combinedProgress$
    .merge( saveNotifications$.map(data => data ? 0.99999 : 1) )
    .startWith(undefined)
  const notifications$ = saveNotifications$
    .map(data => data ? 'All changes have been saved' : undefined)
    //.map(data => undefined)
    .startWith(undefined)
    .distinctUntilChanged()

  // other data
  const appData$ = sources.appMeta

  const visualResources$ = actions.visualResources.startWith([])
    //.forEach(e=>console.log('visualResources',e))

  // combine all the above to get our dynamic state
  const state$ = combineLatestObj({
    selections$,
    bom$,
    comments$,

    // entity components: TODO: seperate to a sub state
    meta$,
    transforms$,
    meshes$,
    types$,
    bounds$,

    // app level data, meta data , settings etc
    operationsInProgress$,
    notifications$,
    appData$,
    settings$,
    // infos about current design etc
    design$,
    assembly$,
    authData$,

    // FIXME  temporary
    visualResources$
  })
    .shareReplay(1)

  return state$
}
