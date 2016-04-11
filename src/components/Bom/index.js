import intent from './intent'
import model from './model'
import view from './view'

export default function Bom ({DOM, props$}) {
  const actions = intent(DOM)
  const state$ = model(props$, actions)
  const vtree$ = view(state$)

  // FIXME: stopgap solution
  actions.removeEntry$.forEach(e => e)

  return {
    DOM: vtree$,
    events: {
      entryTapped$: actions.entryTapped$,
      editEntry$: actions.editEntry$,
      addEntry$: actions.addEntry$,
      removeEntry$: actions.removeEntry$
    }
  }
}
