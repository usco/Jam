require("../../app.css")
import Rx from 'rx'
const merge = Rx.Observable.merge
const of = Rx.Observable.of

//views & wrappers
import Settings from '../../components/widgets/Settings'
import FullScreenToggler from '../../components/widgets/FullScreenToggler/index'
import Help from '../../components/widgets/Help'

import {combineLatestObj} from '../../utils/obsUtils'

import {pick, equals} from 'ramda'

import {EntityInfosWrapper,BOMWrapper,GLWrapper,CommentsWrapper,progressBarWrapper} from '../../components/main/wrappers'

import intent from './intent'
import model  from './model'
import view   from './view'


import api from '../../api'

export default function main(drivers) {
  const {DOM} = drivers

  const actions = intent(drivers)
  const state$  = model(undefined, actions, drivers)

  //create visual elements
  const entityInfos = EntityInfosWrapper(state$,DOM)
  const comments    = CommentsWrapper(state$,DOM)
  const gl          = GLWrapper(state$, drivers)
  const bom         = BOMWrapper(state$,DOM)
  const progressBar = progressBarWrapper(state$,DOM)

  const settingsC   = Settings({DOM, props$:state$})
  const fsToggler   = FullScreenToggler({DOM})
  const help        = Help({DOM, props$:state$})

  //outputs
  const vtree$  = view(state$, settingsC.DOM, fsToggler.DOM, bom.DOM,gl.DOM
    , entityInfos.DOM, comments.DOM, progressBar.DOM, help.DOM)
  const events$ = of( {gl:gl.events, entityInfos:entityInfos.events
    , bom:bom.events, comments:comments.events} )


  function postMsg(api$){
     return api$.map(data=>{
        const {request, response, requestName} = data
        return {target: request.source, message: response, targetOrigin:request.origin, requestName }
      })
  }

  const postMsg$ = postMsg( api( actions,state$ ) )

  //output to localStorage
  //in this case, settings
  const localStorage$ = state$
    .pluck("settings")
    .map( s=>({"jam!-settings":JSON.stringify(s)}) )

  //output to ym
  const bomToYm = state$.pluck("bom")
  const entityMetaToYm = state$.pluck("meta")
  const entityTransformsToYm = state$.pluck("transforms")
  const entitymeshesToYm = state$.pluck("meshes")
  const parts   = state$.pluck("types")
  const design  = state$.pluck('design')
  const authData= state$.pluck('authData')

  const saveDesigntoYm$ = state$
    .filter(state=>state.design.synched)//only try to save anything when the design is in "synch mode" aka has a ur
    .flatMap(_=>
      combineLatestObj({
          bom: bomToYm
        , parts
        , eMetas: entityMetaToYm
        , eTrans: entityTransformsToYm
        , eMeshs: entitymeshesToYm
        , design
        , authData
      })
    )
    .map(function(data){
      return {method:'save', data, type:'design'}
    })
    .distinctUntilChanged(null, equals)

  const loadDesignFromYm$ = actions.loadDesign
    .map(data=>({method:'load', data, type:'design'}))
    .distinctUntilChanged(null, equals)

  const ymStorage$ = merge(saveDesigntoYm$, loadDesignFromYm$)
    .distinctUntilChanged(null, equals)


  //return anything you want to output to drivers
  return {
      DOM: vtree$
      ,events: events$
      ,localStorage:localStorage$

      ,http: actions.requests.http$
      ,desktop:actions.requests.desktop$

      ,postMessage:postMsg$

      ,ym:ymStorage$
  }
}
