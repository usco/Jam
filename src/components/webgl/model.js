import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest

import {preventDefault,isTextNotEmpty,formatData,exists,combineLatestObj} from '../../utils/obsUtils'
import {equals} from 'ramda'

import {makeNoteVisual, makeDistanceVisual, makeThicknessVisual,
makeDiameterVisual, makeAngleVisual} from './visualMakers'

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


function makeRemoteMeshVisual(meta,transform,mesh){
  if(meta && transform && mesh){

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
    //color is stored in meta component
    mesh.material.color.set( meta.color )
    return setFlags(mesh)
  }

}

function getVisual(components){
  const {meta} = components//{components}
  let keys = Object.keys(meta)
  let metas = meta

  return keys.map(function(key){
    let meta = metas[key]
    let transform = components.transforms[key]
    let mesh = components.meshes[key]

    //TODO: refactor this horror
    if(meta.typeUid === "A1")//typeUid:"A1"=> notes
    {   
      return makeNoteVisual(meta, components.meshes)
    }
    else if(meta.typeUid === "A2"){
      return makeThicknessVisual(meta, components.meshes)
    }
    else if(meta.typeUid === "A3"){
      return makeDiameterVisual(meta, components.meshes)
    }
    else if(meta.typeUid === "A4"){
      return makeDistanceVisual(meta, components.meshes)
    }
    else if(meta.typeUid === "A5"){
      return makeAngleVisual(meta, components.meshes)
    }
    else{
      return makeRemoteMeshVisual(meta,transform,mesh)
    }

  })
  .filter(m=>m !== undefined)
}


export default function model(props$, actions){
  const settings$    = props$.pluck('settings')
  const selections$  = props$.pluck('selections').startWith([]).filter(exists).distinctUntilChanged()
  const activeTool$ = settings$.pluck("activeTool").startWith(undefined)
  //every time either activeTool or selection changes, reset/update transform controls

  //composite data
  const meta$       = props$.pluck('meta').distinctUntilChanged()
  const transforms$ = props$.pluck('transforms')//.distinctUntilChanged()
  const meshes$     = props$.pluck('meshes').filter(exists).distinctUntilChanged(function(m){
    return Object.keys(m)
  } )

   //combine All needed components to apply any "transforms" to their visuals
  const items$ = combineLatestObj({meta$,transforms$,meshes$})
    .debounce(1)//ignore if we have too fast changes in any of the 3 components
    //.distinctUntilChanged()
    .map(getVisual)
    //.sample(0, requestAnimationFrameScheduler)
    //.distinctUntilChanged()
    //.do(e=>console.log("DONE with items in GLView",e))

  //"external" selected meshes
  const selectedMeshesFromSelections$ = selections$
    .withLatestFrom(meshes$,function(selections,meshes){
      return selections
        .filter(exists)
        .map(function(s){
          return meshes[s.id]
        })
    })
    .distinctUntilChanged()
    .shareReplay(1)

  const selectedMeshes$ = actions.selectMeshes$//these are only selections made WITHIN the GL view
    .merge(
      selectedMeshesFromSelections$
    )
    //this limits "selectability" to transforms & default 
    .withLatestFrom(activeTool$,function(meshes,tool)
      { 
        let idx = ["translate","rotate","scale",undefined].indexOf(tool)
        let result = (idx > -1) ? meshes : [];

        return result
    })
    .distinctUntilChanged()
    .startWith([])


  return combineLatestObj({
    items$
    ,selectedMeshes$
  })

 
}