import Rx from 'rx'
const {just} = Rx.Observable

// views & wrappers
import Settings from '../../components/Settings'
import FullScreenToggler from '../../components/widgets/FullScreenToggler/index'
import Help from '../../components/widgets/Help'

import { EntityInfosWrapper, BOMWrapper, GLWrapper, CommentsWrapper, progressBarWrapper } from '../../components/main/wrappers'

import intent from './intent'
import model from './model'
import view from './view'

import api from '../../core/api/api'
import formatDataForYMStorage from './dataFormating/formatDataForYMStorage'
import formatDataForLocalStorage from './dataFormating/formatDataForLocalStorage'
import formatDataForFileStorage from './dataFormating/formatDataForFileStorage'

export default function main (sources) {
  const {DOM} = sources

  const actions = intent(sources)
  const state$ = model(undefined, actions, sources)

  // create visual elements
  const entityInfos = EntityInfosWrapper(state$, DOM)
  const comments = CommentsWrapper(state$, DOM)
  const gl = GLWrapper(state$, sources)
  const bom = BOMWrapper(state$, DOM)
  const settingsC = Settings({DOM, props$: state$})
  const fsToggler = FullScreenToggler({DOM})
  const help = Help({DOM, props$: state$})

  // outputs
  const vtree$ = view(state$, settingsC.DOM, fsToggler.DOM, bom.DOM, gl.DOM
    , entityInfos.DOM, comments.DOM, help.DOM)
  const events$ = just({
    gl: gl.events,
    entityInfos: entityInfos.events,
    bom: bom.events,
    comments: comments.events})

  // to postMessage
  const postMsg$ = api(actions, state$).postMsg$

  // localStorage
  const localStorage$ = formatDataForLocalStorage({sources, state$})
  // ymStorage
  const ymStorage$ = formatDataForYMStorage({sources, state$})
  // save file to user hdd
  const fileStorage$ = formatDataForFileStorage({sources, state$}, bom)

  // return anything you want to output to sources
  return {
    DOM: vtree$,
    events: events$,
    postMessage: postMsg$,

    http: actions.requests.http$,
    desktop: actions.requests.desktop$,
    localStorage: localStorage$,
    ym: ymStorage$,
    clipBoard: fileStorage$
  }
}
