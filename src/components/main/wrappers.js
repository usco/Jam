import {Rx} from '@cycle/core'
let just = Rx.Observable.just

import {getExtension, itemsEqual, exists} from '../../utils/utils'
import {combineLatestObj} from '../../utils/obsUtils'

//views etc
import Bom from '../Bom/Bom'
import GLView from '../webgl/GlView3'
import EntityInfos       from '../widgets/EntityInfos'
import Comments from '../widgets/Comments'

//for settings
 /*just({
    ,schema : {
      showGrid:{type:"checkbox",path:"grid.show"}
      ,autoRotate:{type:"checkbox",path:"camera.autoRotate"}
      //,annotations:{type:"checkbox",path:"grid.show"}
    }
  })*/
export function EntityInfosWrapper(state$, DOM) {
  //.distinctUntilChanged(state => state.value)

  function makeEntityInfosProps(state$){
    const selectedInstIds$ = state$
      .pluck("selections")
      .map(s=>s.instIds)
      .filter(s=>s !== undefined)
      .distinctUntilChanged(null,itemsEqual)

    return selectedInstIds$
      .do(e=>console.log("selectedInstIds",e))
      .combineLatest(state$,function(ids,state){
        
        let transforms = ids.map(function(id){
          return state.transforms[id]
        })
        
        let core = ids.map(function(id){
          return state.core[id]
        })
        return {transforms,core}
      })
      .shareReplay(1)
  }
  const props$ = makeEntityInfosProps(state$)

  //entity infos
  return EntityInfos({DOM,props$})
}

export function BOMWrapper(state$, DOM){
  function makeBomProps(state$){
    let fieldNames = ["name","qty","unit","version"]
    let sortableFields = ["id","name","qty","unit"]   
    let fieldNames$ = just(fieldNames)
    let sortableFields$ = just(sortableFields)
    let selectedEntries$ = state$.pluck("selections").pluck("bomIds")

    let entries$ = state$
      .map(s=>s.bom.entries)
      .distinctUntilChanged()

    let bomProps$ = combineLatestObj( {fieldNames$,sortableFields$,entries$,selectedEntries$ })

    return bomProps$
  }
  return Bom({DOM,props$:makeBomProps(state$)})
}

export function GLWrapper(state$, DOM){
  let glProps$  = combineLatestObj({
    settings:state$.pluck("settings")

    ,core:state$.pluck("core")
    ,meshes:state$.pluck("meshes")
    ,transforms:state$.pluck("transforms")
  })

  let glUi      = GLView({DOM,props$:glProps$})
  return glUi
}


export function CommentsWrapper(state$, DOM){

  const selectedInstIds$ = state$
    .pluck("selections")
    .map(s=>s.instIds)
    .filter(s=>s !== undefined)
    .distinctUntilChanged(null,itemsEqual)

  const selections$ = selectedInstIds$
    .combineLatest(state$,function(ids,state){
      //console.log("gnagna gna")
      let core = ids.map(function(id){
        return state.core[id]
      })
      return core
    })
    .map(getFirstsData)
    .shareReplay(1)
    

  function getFirstsData(list){
    if(list.length === 0) return undefined
    return {id:list[0].id,typeUid:list[0].typeUid}
  }


  const props$ = combineLatestObj({
    entity:selections$
    ,comments:state$.pluck("comments")
  })

  return Comments({DOM,props$})
}

