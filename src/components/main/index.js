require("../../app.css")
import Rx from 'rx'
const {merge,just} = Rx.Observable
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

export default function main(sources) {
  const {DOM} = sources

  const actions = intent(sources)
  const state$  = model(undefined, actions, sources)

  //create visual elements
  const entityInfos = EntityInfosWrapper(state$,DOM)
  const comments    = CommentsWrapper(state$,DOM)
  const gl          = GLWrapper(state$, sources)
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


  //ym
  //this are responses from ym
  const designExists$ = sources.ym
    //.tap(e=>console.log("responses from ym",e))
    .filter(res=>res.request.method==='get' && res.request.type === 'ymLoad' && res.request.typeDetail=== 'designExists')
    .flatMap( data => data.catch(_=>just({error:true})) )//flag errors
    .filter(e=>!e.progress)//filter out progress data
    .map(data=> data.error ? false : true)//if we have an error return false, true otherwise
    //.forEach(e=>console.log("designExists: ",e))

  //output to ym
  const bomToYm = state$.pluck('bom')
  const entityMetaToYm = state$.pluck('meta')
  const entityTransformsToYm = state$.pluck('transforms')
  const entitymeshesToYm = state$.pluck('meshes')
  const parts   = state$.pluck('types')
  const design  = state$.pluck('design')
  const authData= state$.pluck('authData')
  const assembly= state$.pluck('assembly')

  //simple query to determine if design already exists
  const queryDesignExists$ = combineLatestObj({design,authData})
    .filter(data=>data.authData.token !== undefined && data.design.synched)//only try to save anything when the design is in "synch mode" aka has a ur
    .map(data=>({data, query:'designExists'}))
    .take(1)

  //saving should NOT take place before load is complete IFAND ONLY IF , we are reloading a design
  const saveDesigntoYm$ = state$
    .filter(state=>state.settings.saveMode===true)//do not save anything if not in save mode
    .filter(state=>state.design.synched && state.authData.token !== undefined )//only try to save anything when the design is in "synch mode" aka has a ur
    //skipUntil(designLoaded)
    .flatMap(_=>
      combineLatestObj({
          bom: bomToYm
        , parts
        , eMetas: entityMetaToYm
        , eTrans: entityTransformsToYm
        , eMeshs: entitymeshesToYm
        , design
        , authData
        , assembly
      })
    )
    .map(function(data){
      return {method:'save', data, type:'design'}
    })
    .distinctUntilChanged(null, equals)

  //if the design exists, load data, otherwise...whataver
  const loadDesignFromYm$ = designExists$//actions.loadDesign
    .withLatestFrom(state$.pluck('settings','saveMode'),function(designExists, saveMode){
      return designExists && !saveMode
    })
    .filter(e=>e===true)//filter out non existing designs (we cannot load those , duh')
    .flatMap(_=>combineLatestObj({design, authData}))//we inject design & authData
    .map(data=>({method:'load', data, type:'design'}))//create our query/request
    .throttle(5)
    .distinctUntilChanged(null, equals)
    .take(1)
    .tap(e=>console.log("loadDesignFromYm",e))


  const ymStorage$ = merge(queryDesignExists$, saveDesigntoYm$, loadDesignFromYm$)
    .distinctUntilChanged(null, equals)


  //return anything you want to output to sources
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
