import {Rx} from '@cycle/core'
import {createComponent,removeComponent,makeActionsFromApiFns} from './common'
import {makeModelNoHistory, mergeData} from '../../../utils/modelUtils'


////BoundingBox//////
export function makeBoundingSystem(){
  const defaults = {}

  const  boundsDefaults ={
    min:[0,0,0],
    max:[0,0,0]
  }

  let updateFns = {
    createComponent: createComponent.bind(null,boundsDefaults)
    , removeComponent}

  let actions = makeActionsFromApiFns(updateFns)
  let bounds$ = makeModelNoHistory(defaults, updateFns, actions)

  return {bounds$,boundActions:actions}
}