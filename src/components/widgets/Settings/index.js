import intent from './intent'
import model from './model'
import view from './view'

// fyi for now, we hardcode some of the ui
function Settings ({DOM, props$}, name = '') {
  const actions = intent(DOM)
  const state$ = model(props$, actions)
  const vtree$ = view(state$)

  return {
    DOM: vtree$
  }
}

export default Settings
