import Rx from 'rx'
let Observable = Rx.Observable
let merge = Rx.Observable.merge


//import {selectEntities$} from '../entities/actions'
import {toArray} from '../../utils/utils'


///defaults, what else ?
const defaults = {
  selectedIds:[]
  ,bomIds:[]
}

function selectEntities(state, input){
  //log.info("selecting entitites",sentities)
  let entityIds = toArray(input)

  state.selectedIds = entityIds
  return state
}

function selectBomEntries(state, input){
  //log.info("selecting bom entries",sBomIds)
  let bomIds = toArray(input)

  state.bomIds = bomIds
  return state
}

function makeModifications(intent){

  /*select given entities*/
  let _selectEntities$ = intent.selectEntities$ 
    .distinctUntilChanged()//we do not want to be notified multiple times in a row for the same selections
    .map((sentityIds) => (selections) => {
      return selectEntities(selections,sentityIds)
    })

  let _selectBomEntries$ = intent.selectBomEntries$
    .distinctUntilChanged()
    .map((sBomIds) => (selections) => {
      return selectBomEntries(selections,sBomIds)
    })

  return merge(
    _selectEntities$
    ,_selectBomEntries$
  )

}

function selections(intent, source) {
  let source$ = source || Observable.just(defaults)

  let modification$ = makeModifications(intent)

  return modification$
    .merge(source$)
    .scan((selections, modFn) => modFn(selections))//combine existing data with new one
    .distinctUntilChanged()
    .shareReplay(1)
}

export default selections