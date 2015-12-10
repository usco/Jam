require("../../app.css")
import Rx from 'rx'
const merge = Rx.Observable.merge
const of = Rx.Observable.of

//views & wrappers
import Settings from '../../components/widgets/Settings'
import FullScreenToggler from '../../components/widgets/FullScreenToggler/index'
import Help from '../../components/widgets/Help'

import {EntityInfosWrapper,BOMWrapper,GLWrapper,CommentsWrapper,progressBarWrapper} from '../../components/main/wrappers'


import intent from './intent'
import model  from './model'
import view   from './view'


import {domElementToImage,aspectResize} from '../../utils/imgUtils'


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

  const http$ = actions.requests$


  function api(actions, state$)
  {
    const transforms$ = actions.utilityActions
      .getTransforms$
      .withLatestFrom(state$.pluck("transforms"),function(request,transforms){
        //console.log("getTransforms",request,transforms)
        const transformsList = Object.keys(transforms).reduce(function(acc,key){
          //console.log("acc,cur",acc,key)
          let trs = Object.assign({},transforms[key],{id:key})
          let out = acc.concat([trs])
          return out
        },[])
        return {request,response:transformsList, requestName:"getTransforms"}
      })

    const status$ = actions.utilityActions
      .getStatus$
      .withLatestFrom(state$.pluck("settings"),function(request,settings){

        const response = {
          activeTool:settings.activeTool
        }
        return {request, response, requestName:"getStatus"}
      })

    const screenCapture$ = actions.utilityActions
      .captureScreen$
      .map(function(data){
        let {request,element} = data
        let img = domElementToImage(element)
        return {request, response:img, requestName:"captureScreen"}
      })

    return merge(
      transforms$
      ,status$
      ,screenCapture$
    )
  }

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

  //return anything you want to output to drivers
  return {
      DOM: vtree$
      ,events: events$
      ,localStorage:localStorage$

      ,http: http$
      ,desktop:actions.desktop$

      ,postMessage:postMsg$
  }
}

