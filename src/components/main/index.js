require("../../app.css")
import Rx from 'rx'
const just = Rx.Observable.just

//views & wrappers
import Settings from '../../components/widgets/Settings'
import FullScreenToggler from '../../components/widgets/FullScreenToggler/index'
import Help from '../../components/widgets/Help'

import {EntityInfosWrapper,BOMWrapper,GLWrapper,CommentsWrapper,progressBarWrapper} from '../../components/main/wrappers'


import intent from './intent'
import model  from './model'
import view   from './view'


function requests(){
  return Rx.Observable.never()
}

export default function main(drivers) {
  const {DOM} = drivers
  
  const actions = intent(drivers)
  const state$  = model(undefined, actions, drivers)
  
  //create visual elements
  const entityInfos = EntityInfosWrapper(state$,DOM)
  const comments    = CommentsWrapper(state$,DOM)
  const gl          = GLWrapper(state$,DOM)
  const bom         = BOMWrapper(state$,DOM)
  const progressBar = progressBarWrapper(state$,DOM)

  const settingsC   = Settings({DOM, props$:state$})
  const fsToggler   = FullScreenToggler({DOM})
  const help        = Help({DOM, props$:state$})

  //outputs 
  const vtree$  = view(state$, settingsC.DOM, fsToggler.DOM, bom.DOM,gl.DOM
    , entityInfos.DOM, comments.DOM, progressBar.DOM, help.DOM)
  const events$ = just( {gl:gl.events, entityInfos:entityInfos.events
    , bom:bom.events, comments:comments.events} )

  const requests$ = actions.requests$ //requests()

    requests$.forEach(e=>console.log("outgoing requests",e))
  //output to localStorage
  //in this case, settings
  const localStorage$ = state$
    .pluck("settings")
    .map( s=>({"jam!-settings":JSON.stringify(s)}) )

  //return anything you want to output to drivers
  return {
      DOM: vtree$
      ,events: events$
      ,localStorage:localStorage$

      ,http: requests$
      ,desktop:actions.desktop$
  }
}

