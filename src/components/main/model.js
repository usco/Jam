import Rx from 'rx'

import { combineLatestObj, replicateStream } from '../../utils/obsUtils'
import { toArray } from '../../utils/utils'

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
  const comments$ = comments(actions.commentActions)

  const {createMeshComponents$, componentBase$, assembly$} = entitiesExtra(actions, types$)
  entityActions.createMeshComponents$ = createMeshComponents$

  // annotations
  let addAnnotations$ = addAnnotation(actions.annotationsActions, settings$)
    .map(toArray)

  const proxySelections$ = new Rx.ReplaySubject(1)

  entityActions = remapEntityActions(entityActions, proxySelections$)

  const metaActions = remapMetaActions(entityActions, componentBase$, proxySelections$, addAnnotations$)
  const meshActions = remapMeshActions(entityActions, componentBase$, proxySelections$)
  const transformActions = remapTransformActions(entityActions, componentBase$, proxySelections$)
  const boundActions = remapBoundsActions(entityActions, componentBase$, proxySelections$)

  const {meta$} = makeMetaSystem(metaActions)
  const {meshes$} = makeMeshSystem(meshActions)
  const {transforms$} = makeTransformsSystem(transformActions)
  const {bounds$} = makeBoundingSystem(boundActions)

  // selections => only for real time view
  const typesInstancesRegistry$ = makeTypeInstanceMapping(meta$, types$)
  const selections$ = selections(selectionsIntents(sources, {idsMapper$: typesInstancesRegistry$}))
    .merge(metaActions.removeComponents$.map(a => ({instIds: [], bomIds: []}))) // after an instance is removed, unselect

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

  const bomActions = bomIntents(sources, types$, metaActions, entityActions)
  const bom$ = bom(bomActions)

  // not entirely sure, we need a way to observe any fetch/updload etc operation
  const operationsInProgress$ = actions.progress.combinedProgress$.startWith(undefined)

  // ////other data
  const appData$ = sources.appMeta

  // combine all the above to get our dynamic state
  const state$ = combineLatestObj({
    selections$,
    bom$,
    comments$,
    // entity components
    meta$,
    transforms$,
    meshes$,
    types$, // app level data, meta data , settings etc
    operationsInProgress$,
    appData$,
    settings$,
    // infos about current design etc
    design$,
    assembly$,
    authData$})
    .shareReplay(1)

  return state$
}
