import {Rx} from '@cycle/core'
let fromEvent = Rx.Observable.fromEvent
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest

import {preventDefault,isTextNotEmpty,formatData,exists,combineLatestObj} from '../../utils/obsUtils'

let requestAnimationFrameScheduler = Rx.Scheduler.requestAnimationFrame
   //problem : this fires BEFORE the rest is ready
  //activeTool$.skip(1).filter(isTransformTool).subscribe(transformControls.setMode)

export default function model(props$, actions){
  const update$      = Rx.Observable.interval(16,66666666667)
  const settings$    = props$.pluck('settings')
  const selections$  = props$.pluck('selections').startWith([]).filter(exists).distinctUntilChanged()
  //every time either activeTool or selection changes, reset/update transform controls

  const activeTool$ = settings$.pluck("activeTool").startWith(undefined)

  //composite data
  let core$       = props$.pluck('core').distinctUntilChanged()
  let transforms$ = props$.pluck('transforms')//.distinctUntilChanged()
  let meshes$     = props$.pluck('meshes').filter(exists).distinctUntilChanged(function(m){
    return Object.keys(m)
  } )

  //combine All needed components to apply any "transforms" to their visuals
  let items$ = combineLatestObj({core$,transforms$,meshes$})
    .debounce(5)//ignore if we have too fast changes in any of the 3 components
    //.distinctUntilChanged()
    .map(function({core,transforms,meshes}){

      let keys = Object.keys(core)
      //console.log("items change in GLView")
      let cores = core

      return keys.map(function(key){
        let transform = transforms[key]
        let mesh = meshes[key]
        let core = cores[key]

        if(core && transform && mesh){

          //console.log("transforms",transform)
          mesh.position.fromArray( transform.pos )
          mesh.rotation.fromArray( transform.rot )
          mesh.scale.fromArray( transform.sca )

          //color is stored in core component
          mesh.material.color.set( core.color )
          return setFlags(mesh)
        }
      })
      .filter(m=>m !== undefined)

    })
    .filter(m=> (m.length > 0))
    .sample(0, requestAnimationFrameScheduler)
    //.distinctUntilChanged()
    .do(e=>console.log("DONE with items in GLView",e))


  //this limits "selectability" to transforms & default 
  const selectedMeshes$ = actions.selectMeshes$
    . withLatestFrom(activeTool$,function(meshes,tool)
      {
        let idx = ["translate","rotate","scale",undefined].indexOf(tool)
        let result = (idx > -1) ? meshes : [];
        return result
      })

  return {


  }
}