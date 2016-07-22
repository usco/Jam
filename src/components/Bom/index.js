import intent from './intent'
import model from './model'
import view from './view'

export default function Bom ({DOM, props$}) {
  const actions = intent(DOM)
  const state$ = model(props$, actions)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    events: {
      entryTapped$: actions.entryTapped$,
      entryDoubleTapped$: actions.entryDoubleTapped$,
      entryLongTapped$: actions.entryLongTapped$,
      editEntry$: actions.editEntry$,
      addEntry$: actions.addEntry$,
      removeEntry$: actions.removeEntry$
    },
    //FIXME: not sure
    fileStorage: {
      exportBOMAsJson$: actions.exportAsJson$,
      exportBOMAsText$: actions.exportAsText$
    }
  }
}
