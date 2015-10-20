import {Rx} from '@cycle/core'
let fromEvent = Rx.Observable.fromEvent
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest

import {preventDefault,isTextNotEmpty,formatData,exists,combineLatestObj} from '../../utils/obsUtils'
import {equals} from 'ramda'


let requestAnimationFrameScheduler = Rx.Scheduler.requestAnimationFrame
   //problem : this fires BEFORE the rest is ready
  //activeTool$.skip(1).filter(isTransformTool).subscribe(transformControls.setMode)

function setFlags(mesh){
  mesh.selectable      = true
  mesh.selectTrickleUp = false
  mesh.transformable   = true
  //FIXME: not sure, these are very specific for visuals
  mesh.castShadow      = true
  return mesh
}

export default function model(props$, actions){
  const settings$    = props$.pluck('settings')
  const selections$  = props$.pluck('selections').startWith([]).filter(exists).distinctUntilChanged()
  const activeTool$ = settings$.pluck("activeTool").startWith(undefined)
  //every time either activeTool or selection changes, reset/update transform controls

  //composite data
  const core$       = props$.pluck('core').distinctUntilChanged()
  const transforms$ = props$.pluck('transforms')//.distinctUntilChanged()
  const meshes$     = props$.pluck('meshes').filter(exists).distinctUntilChanged(function(m){
    return Object.keys(m)
  } )

   //combine All needed components to apply any "transforms" to their visuals
  const items$ = combineLatestObj({core$,transforms$,meshes$})
    .debounce(5)//ignore if we have too fast changes in any of the 3 components
    //.distinctUntilChanged()
    .map(function({core,transforms,meshes}){

      let keys = Object.keys(core)
      let cores = core

      return keys.map(function(key){
        let transform = transforms[key]
        let mesh = meshes[key]
        let core = cores[key]

        if(core && transform && mesh){

          //only apply changes to mesh IF the current transform is different ?
          //console.log("transforms",transform)
          if( !equals(mesh.position.toArray() , transform.pos) )
          {
            mesh.position.fromArray( transform.pos )
          }
          if( !equals(mesh.rotation.toArray() , transform.rot) )
          {
            mesh.rotation.fromArray( transform.rot )
          }
          if( !equals(mesh.scale.toArray() , transform.sca) )
          {
            mesh.scale.fromArray( transform.sca )
          }
          
          //color is stored in core component
          mesh.material.color.set( core.color )
          return setFlags(mesh)
        }
      })
      .filter(m=>m !== undefined)
    })
    //.sample(0, requestAnimationFrameScheduler)
    //.distinctUntilChanged()
    //.do(e=>console.log("DONE with items in GLView",e))

  const selectedMeshesFromSelections$ = selections$
    .withLatestFrom(meshes$,function(selections,meshes){
      return selections.map(function(s){
        return meshes[s.id]
      })
    })
    .distinctUntilChanged()
    .shareReplay(1)

  const selectedMeshes$ = actions.selectMeshes$
    //this limits "selectability" to transforms & default 
    . withLatestFrom(activeTool$,function(meshes,tool)
      {
        let idx = ["translate","rotate","scale",undefined].indexOf(tool)
        let result = (idx > -1) ? meshes : [];
        return result
    })
    .merge(
      selectedMeshesFromSelections$
    )
    .startWith([])

  return combineLatestObj({
    items$
    ,selectedMeshes$
  })
 
}