import {Rx} from '@cycle/core'
import {createComponents,removeComponents,makeActionsFromApiFns} from './common'
import {makeModel, mergeData} from '../../../utils/modelUtils'


////BoundingBox//////
export function makeBoundingSystem(actions){
  const defaults = {}

  const  boundsDefaults ={
    min:[0,0,0],
    max:[0,0,0]
  }

  let updateFns = {
    createComponents: createComponents.bind(null,boundsDefaults)
    , removeComponents}


  if(!actions){
    actions   = makeActionsFromApiFns(updateFns)
  }

  let bounds$ = makeModel(defaults, updateFns, actions)

  return {bounds$,boundActions:actions}
}