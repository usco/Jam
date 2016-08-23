import Rx from 'rx'
const merge = Rx.Observable.merge
import { generateUUID, toArray } from '../../utils/utils'
import { mergeData } from '../../utils/modelUtils'

// function to add extra data to all entity component actions
export function remapEntityActions (entityActions, currentSelections$) {
  const duplicateInstances$ = entityActions.duplicateInstances$
    .withLatestFrom(currentSelections$, function (_, selections) {
      // console.log("selections to duplicate",selections)
      const newId = generateUUID()
      return selections.map(s => mergeData(s, {newId}))
    })
    .share()

  const deleteInstances$ = entityActions.deleteInstances$
    .withLatestFrom(currentSelections$, function (deleteInfos, selections) {
      // console.log("I am asked to delete instances",deleteInfos,selections)
      if (deleteInfos === undefined) { // delete by id, based on selections
        return selections
      } else { // delete by typeUid, based on input data
        return deleteInfos
      }
    })
    .tap(e => console.log('I am going to delete instances', e))
    .share()

  const mirrorInstances$ = entityActions.mirrorInstances$
    .withLatestFrom(currentSelections$, function (mirrorInfos, selections) {
      return selections.map(s => mergeData(s, mirrorInfos))
    })
    .share()

  return mergeData(entityActions,
    {
      duplicateInstances$,
      deleteInstances$,
      mirrorInstances$
    })
}

// function to add extra data to meta component actions
export function remapMetaActions (entityActions, componentBase$, currentSelections$, annotationCreations$) {
  const createComponentsFromBase$ = componentBase$
    .filter(c => c.length > 0)
    .map(function (datas) {
      return datas.map(function ({instUid, typeUid, assemblyId, instance}) {
        return {
          id: instUid,
          value: { id: instUid, typeUid, name: instance.name, assemblyId }
        }
      })
    })

  const createComponentsFromAnnots$ = annotationCreations$
    .filter(c => c.length > 0)
    .map(function (datas) {
      return datas.map(function (data) {
        console.log('annotation data', data)
        return { id: data.id, value: data }
      })
    })

  const createComponents$ = merge(
    createComponentsFromBase$
    , createComponentsFromAnnots$
    , entityActions.createMetaComponents$ // not infered
  ).share()
  // .tap(e=>console.log("creating meta component",e))

  const updateComponents$ = entityActions.updateComponent$
    .filter(u => u.target === 'meta')
    .pluck('data')
    .withLatestFrom(currentSelections$.map(s => s.map(s => s.id)), function (metaChanges, instIds) {
      return instIds.map(function (instId) {
        return {id: instId, value: metaChanges}
      })
    })

  return {
    createComponents$,
    updateComponents$,
    duplicateComponents$: entityActions.duplicateInstances$,
    removeComponents$: entityActions.deleteInstances$,
    clearDesign$: entityActions.clearDesign$
  }
}

// function to add extra data to mesh component actions
export function remapMeshActions (entityActions, componentBase$) {
  const createComponents$ = componentBase$
    .filter(c => c.length > 0)
    .map(function (datas) {
      return datas.map(function ({instUid, mesh}) {
        return { id: instUid, value: { mesh } }
      })
    })
    .merge(entityActions.createMeshComponents$) // not infered
    // .tap(e=>console.log("creating mesh component",e))

  return {
    createComponents$,
    duplicateComponents$: entityActions.duplicateInstances$,
    removeComponents$: entityActions.deleteInstances$,
    clearDesign$: entityActions.clearDesign$
  }
}

// function to add extra data to transform component actions
export function remapTransformActions (entityActions, componentBase$, settings$, currentSelections$) {
  const createComponents$ = componentBase$
    .filter(c => c.length > 0)
    .map(function (datas) {
      return datas.map(function ({instUid, zOffset}) {
        return { id: instUid, value: {pos: [0, 0, zOffset]} }
      })
    })
    .merge(entityActions.createTransformComponents$)
    // .tap(e=>console.log("creating transforms component",e))

  const updateComponents$ = entityActions.updateComponent$
    .filter(u => u.target === 'transforms')
    .pluck('data')
    .map(toArray)// we always expect arrays of data
    /*.withLatestFrom(settings$, function (transforms, settings) {
      return transforms.map(function (transform, index) {
        return {id: transform.id, value: transform || transforms[0], settings}
      })
    })*/
    .withLatestFrom(settings$, function (transforms, settings) {
      return transforms.map(function (transform, index) {
        return mergeData({}, transform, {settings})
        //return {id: transform.id, value: transform.value || transforms[0].value, settings}
      })
    })

  return {
    createComponents$,
    updateComponents$,
    resetScaling$: entityActions.resetScaling$,
    mirrorComponents$: entityActions.mirrorInstances$,
    duplicateComponents$: entityActions.duplicateInstances$,
    removeComponents$: entityActions.deleteInstances$,
    clearDesign$: entityActions.clearDesign$
  }
}

// function to add extra data to bounds component actions
export function remapBoundsActions (entityActions, componentBase$) {
  const createComponents$ = componentBase$
    .filter(c => c.length > 0)
    .map(function (datas) {
      return datas.map(function ({instUid, bbox}) {
        return { id: instUid, value: bbox }
      })
    })

  return {
    createComponents$,
    duplicateComponents$: entityActions.duplicateInstances$,
    removeComponents$: entityActions.deleteInstances$,
    clearDesign$: entityActions.clearDesign$
  }
}
