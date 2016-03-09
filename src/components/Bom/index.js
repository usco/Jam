/** @jsx hJSX */
import Cycle from '@cycle/core'
import Rx from 'rx'
import {hJSX} from '@cycle/dom'
import Class from "classnames"

import intent from './intent'
import model from './model'
import view from './view'

export default function Bom({DOM, props$}) {

  const actions = intent(DOM)
  const state$  = model(props$,actions)
  const vtree$  = view(state$)

  return {
    DOM: vtree$,
    events: {
      entryTapped$:actions.entryTapped$
      ,editEntry$:actions.editEntry$
      ,addEntry$:actions.addEntry$
    }
  }
}
