import {Rx} from '@cycle/core'
const just = Rx.Observable.just

import {getExtension, itemsEqual, exists} from '../../utils/utils'
import {equals} from 'Ramda'
import {combineLatestObj} from '../../utils/obsUtils'

//nested dialogues etc
import Bom         from '../Bom'
import GLView      from '../webgl/GlView'
import EntityInfos from '../widgets/EntityInfos'
import Comments    from '../widgets/Comments'
import ProgressBar from '../widgets/ProgressBar'

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
      .distinctUntilChanged(null,equals)

    return selectedInstIds$
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
    let fieldNames = ["name","qty","unit","version","printable"]
    let sortableFields = ["id","name","qty","unit","printable"]  
    let editableFields = ["name"] 

    let fieldNames$ = just(fieldNames)
    let editableFields$ = just(editableFields)
    let sortableFields$ = just(sortableFields)
    let selectedEntries$ = state$.pluck("selections").pluck("bomIds")

    let entries$ = state$
      .map(s=>s.bom.entries)
      .distinctUntilChanged()

    let bomProps$ = combineLatestObj( {fieldNames$,sortableFields$,editableFields$,entries$,selectedEntries$ })

    return bomProps$
  }
  return Bom({DOM,props$:makeBomProps(state$)})
}

export function GLWrapper(state$, DOM){

  const selectedInstIds$ = state$
    .pluck("selections")
    .map(s=>s.instIds)
    .filter(s=>s !== undefined)
    .distinctUntilChanged(null,equals)

  const selections$ = selectedInstIds$
    .withLatestFrom(state$,function(ids,state){
      //console.log("gnagna gna")
      let core = ids.map(function(id){
        return state.core[id]
      })
      return core
    })
    .shareReplay(1)


  let glProps$  = combineLatestObj({
    settings:state$.pluck("settings")
    ,selections$

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
    .distinctUntilChanged(null,equals)

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
    if(!list[0]) return undefined

    return {id:list[0].id,typeUid:list[0].typeUid}
  }


  const props$ = combineLatestObj({
    entity:selections$
    ,comments:state$.pluck("comments")
  })

  return Comments({DOM,props$})
}

export function progressBarWrapper(state$, DOM){
  //const props$ = just({progress:0.32})

  const props$ = state$.distinctUntilChanged()
    .pluck("remoteOperations")
    .filter(exists)
    .distinctUntilChanged()
    .pluck("resource")
    .map(function(resource){
      let progress = 0
      //FIXME: horrid
      if(resource.fetched && resource.loaded){
        progress = 100
      }
      else
      {
        console.log("resource.fetchProgress",resource.fetchProgress)
        progress = resource.fetchProgress
      }
      return {progress}
    })
    .startWith({progress:100})
  //props$
  //.subscribe(e=>console.log("remoteOperations",e))

  function extractData(resource){
    resource.fetchProgress
    resource.parseProgress 
  }

  return ProgressBar({DOM,props$})
}


