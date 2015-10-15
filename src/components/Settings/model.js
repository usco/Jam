import {Rx} from '@cycle/core'
import {combineLatestObj} from '../../utils/obsUtils'

export default function model(props$,actions){
  let settings$ = props$.pluck('settings')
  let schema$   = props$.pluck('schema').startWith({})

  const toggled$ = actions.toggled$

  return combineLatestObj({settings$,toggled$})
}