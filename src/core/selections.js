import Rx from 'rx'
let Observable = Rx.Observable
let merge = Rx.Observable.merge


import {selectEntities$} from '../actions/entityActions'
import {toArray} from '../utils/utils'


///defaults, what else ?
const defaults = {
  selectedIds:[],
}


function makeModification$(intent){

  /*select given entities*/
  let _selectEntities$ = intent.selectEntities$ 
    .distinctUntilChanged()//we do not want to be notified multiple times in a row for the same selections
    .map((sentityIds) => (selections) => {
      //log.info("selecting entitites",sentities)

      let entityIds = toArray(sentityIds)

      selections.selectedIds = entityIds
      return selections
    })

  return merge(
    _selectEntities$
  )

}

function selections(intent, source) {
  let source$ = source || Observable.just(defaults)

  //not sure about this one
  intent.selectEntities$ = intent.selectEntities$.merge(selectEntities$)

  let modification$ = makeModification$(intent)

  return modification$
    .merge(source$)
    .scan((selections, modFn) => modFn(selections))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)
}

export default selections