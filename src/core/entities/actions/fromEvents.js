import Rx from 'rx'
const {merge} = Rx.Observable
import {first} from '../../../utils/otherUtils'
import {exists,toArray} from '../../../utils/utils'

export default function intent(events, params){
  //entities/components
  const updateMetaComponent$ = events
    .select("entityInfos")
    .events("changeMeta$")
    .map(c=>( {target:"meta",data:c}))

  const updateTransformComponent$ = events
    .select("entityInfos")
    .events("changeTransforms$")
    .merge(
      events
        .select("gl")
        .events("selectionsTransforms$")
        .debounce(20)
    )
    .map(c=>( {target:"transforms",data:c}))

  const updateComponent$ = merge(
    updateMetaComponent$
    ,updateTransformComponent$
  )

  //measurements & annotations
  const shortSingleTaps$ = events
    .select("gl").events("shortSingleTaps$")

  const createAnnotationStep$ = shortSingleTaps$
    .map( (event)=>event.detail.pickingInfos)
    .filter( (pickingInfos)=>pickingInfos.length>0)
    .map(first)
    .share()

  /*const annotationsActions =  {
    creationStep$: actionsFromEvents.createAnnotationStep$
  }*/

  return {
    updateComponent$
    ,createAnnotationStep$
  }
}
