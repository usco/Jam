import Rx from 'rx'
const merge = Rx.Observable.merge
import {first} from '../../utils/otherUtils'
import {exists,toArray} from '../../utils/utils'


export function intentsFromEvents(drivers){
  const events = drivers.events

  //entities/components
  const updateCoreComponent$ = events
    .select("entityInfos")
    .events("changeCore$")
    .map(c=>( {target:"core",data:c}))

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
    updateCoreComponent$
    ,updateTransformComponent$
  )
  //bom
  const updateBomEntries$ = events
    .select("bom").events("editEntry$").map(toArray)

  //measurements & annotations
  const shortSingleTaps$ = events
    .select("gl").events("shortSingleTaps$")

  const createAnnotationStep$ = shortSingleTaps$
    .map( (event)=>event.detail.pickingInfos)
    .filter( (pickingInfos)=>pickingInfos.length>0)
    .map(first)
    .share()  

  return {
    updateComponent$
    ,createAnnotationStep$
    ,updateBomEntries$
  }
}