import Rx from 'rx'
const just = Rx.Observable.just

import { exists } from '../../utils/utils'
import { equals } from 'ramda'
import { combineLatestObj } from '../../utils/obsUtils'

// nested dialogues etc
import Bom from '../Bom'
import GLView from '../webgl/GlView'
import Comments from '../Comments'

import EntityInfos from '../EntityInfos'
import ProgressBar from '../widgets/ProgressBar'

// for settings
/* just({
   ,schema : {
     showGrid:{type:"checkbox",path:"grid.show"}
     ,autoRotate:{type:"checkbox",path:"camera.autoRotate"}
     //,annotations:{type:"checkbox",path:"grid.show"}
   }
 })*/
export function EntityInfosWrapper (state$, DOM) {

  function makeEntityInfosProps (state$) {
    const selectedInstIds$ = state$
      .pluck('selections')
      .map(s => s.instIds)
      .filter(s => s !== undefined)
      .distinctUntilChanged(null, equals)

    return selectedInstIds$
      .combineLatest(state$, function (ids, state) {
        const transforms = ids.map(function (id) {
          return state.transforms[id]
        })

        const meta = ids.map(function (id) {
          return state.meta[id]
        })

        const bounds = ids.map(function (id) {
          return state.bounds[id]
        })

        const selections = ids


        return {transforms, bounds, meta, settings: state.settings, selections}
      })
      .shareReplay(1)
  }
  const props$ = makeEntityInfosProps(state$)

  /*const props$ = state$.map(function(state){

    const data = state.selections.instIds.reduce(function (acc, id) {
      acc['transforms'].push(state.transforms[id])
      acc['meta'].push(state.meta[id])
      return acc
    }, {transforms: [], meta: [], settings})
    return assign({}, state, {__data: data})
  })*/

  // entity infos
  return EntityInfos({DOM, props$})
}

export function BOMWrapper (state$, DOM) {
  function makeBomProps (state$) {
    const fieldNames = ['name', 'qty', 'phys_qty', 'unit', 'printable']
    const sortableFields = ['id', 'name', 'qty', 'unit', 'printable']
    const editableFields = ['name', 'qty', 'phys_qty']
    const fieldDescriptions = {
      'name': 'name of the parts',
      'qty': 'quantities of this parts',
      'phys_qty': 'physical quantity: ie 10 cm',
      'unit': 'use EA for "each", or SI/ imperial units',
      'printable': 'is this a printable part?'
    }
    const fieldTypes = {
      'name': 'text',
      'qty': 'number',
      'phys_qty': 'number',
      'unit': 'list',
      'printable': 'boolean'
    }

    const fieldNames$ = just(fieldNames)
    const editableFields$ = just(editableFields)
    const sortableFields$ = just(sortableFields)
    const selectedEntries$ = state$.pluck('selections').pluck('bomIds')
    const fieldDescriptions$ = just(fieldDescriptions)
    const fieldTypes$ = just(fieldTypes)
    const units$ = just(['EA', 'm', 'in', 'kg', 'lb', 'l'])
    // let show$            = state$.pluck("settings").pluck("appMode").map(mode=> mode !=='viewer')
    const entries$ = state$
      .map(s => s.bom)
      .distinctUntilChanged()
    const readOnly$ = state$.pluck('settings')
      .map(s => !(s.toolSets.indexOf('edit') !== -1))

    let bomProps$ = combineLatestObj({
      fieldNames$,
      sortableFields$,
      editableFields$,
      entries$,
      selectedEntries$,
      fieldDescriptions$,
      fieldTypes$,
      units$,
      readOnly$})

    return bomProps$
  }
  return Bom({DOM, props$: makeBomProps(state$)})
}

export function GLWrapper (state$, drivers) {
  const selectedInstIds$ = state$
    .pluck('selections')
    .map(s => s.instIds)
    .filter(s => s !== undefined)
    .distinctUntilChanged(null, equals)

  const selections$ = selectedInstIds$
    .withLatestFrom(state$, function (ids, state) {
      return ids.map(function (id) {
        return state.meta[id]
      })
    })
    .shareReplay(1)

  const focusedEntities$ = state$
    .pluck('selections')
    .map(s => s.focusInstIds)
    .filter(s => s !== undefined)

  let glProps$ = combineLatestObj({
    settings: state$.pluck('settings'),
    selections$,
    focusedEntities$,
    meta: state$.pluck('meta'),
    meshes: state$.pluck('meshes'),
    transforms: state$.pluck('transforms'),
    rawVisuals: state$.pluck('visualResources')
  })

  let glUi = GLView({drivers, props$: glProps$})
  return glUi
}

export function CommentsWrapper (state$, DOM) {
  const selectedInstIds$ = state$
    .pluck('selections')
    .map(s => s.instIds)
    .filter(s => s !== undefined)
    .distinctUntilChanged(null, equals)

  const selections$ = selectedInstIds$
    .combineLatest(state$, function (ids, state) {
      // console.log("gnagna gna")
      let meta = ids.map(function (id) {
        return state.meta[id]
      })
      return meta
    })
    .map(getFirstsData)
    .shareReplay(1)

  function getFirstsData (list) {
    if (list.length === 0) return undefined
    if (!list[0]) return undefined

    return {id: list[0].id, typeUid: list[0].typeUid}
  }

  const props$ = combineLatestObj({
    entity: selections$, comments: state$.pluck('comments')
  })

  return Comments({DOM, props$})
}
