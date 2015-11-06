import helpers from 'glView-helpers'
const annotations = helpers.annotations
import THREE from 'three'
import {mergeData} from '../../utils/modelUtils'

import {find,propEq} from 'ramda'



function meshesFromDeps(deps, getVisual, entities$){
  /*let observables = deps
    .map(getEntityByIuid)
    .map(getVisual)
    .map(s=>s.take(1))//only need one, also, otherwise, forkjoin will not fire
  //return Rx.Observable.forkJoin( observables )*/

  return Rx.Observable.just(null)//how can I not use this one ?
    .combineLatest(entities$.pluck("byId"),function(x,byId){
      //console.log("byId",byId,deps)
      return deps
        .map(d=>byId[d])
        .filter(x=>x!==undefined)
        .map(getVisual)
        .map(s=>s.take(1))
    })
    //.do(e=>console.log("got some data",e))
    .flatMap(Rx.Observable.forkJoin)
    //.do(e=>console.log("got some data2",e))
    //.subscribe(x=>console.log("deps",x))
}

function makeNoteVisual_old(entity, subJ, params){
  console.log("note annot",entity)
  let {getVisual,entities$} = params
  let point = entity.target.point
  let deps = [entity.target.id]

  function visual(mesh){
    //mesh.updateMatrix()
    //mesh.updateMatrixWorld()
    let pt = new THREE.Vector3().fromArray(point)//.add(mesh.position)
    pt = mesh.localToWorld(pt)

    let params = {
      point:pt,
      object:mesh}
    params = mergeData(params,annotStyle)

    return new annotations.NoteVisual(params)
  }

  meshesFromDeps(deps, getVisual, entities$)
    .subscribe(function(data){
      subJ.onNext(visual(data[0]))
    })
}


  let annotStyle = {
    crossColor:"#000",
    textColor:"#000",
    lineColor:"#000",
    arrowColor:"#000",
    lineWidth:2.2,
    highlightColor: "#60C4F8",//"#00F",
    fontFace:"Open Sans"
  }

function resolveMeshes(deps, visualCallback, meshes){
  /*return Rx.Observable.just(null)//how can I not use this one ?
    .combineLatest(entities$.pluck("byId"),function(x,byId){
      //console.log("byId",byId,deps)
      return deps
        .map(d=>byId[d])
        .filter(x=>x!==undefined)
        .map(getVisual)
        .map(s=>s.take(1))
    })
    //.do(e=>console.log("got some data",e))
    .flatMap(Rx.Observable.forkJoin)*/

  let bla = deps.map(function(dep){
      return meshes[dep]
    })

  console.log("bla",bla)

  return bla.reduce(function(acc,cur){
      console.log("reduce",acc,cur)
      return visualCallback(cur)
    },[])

  /*return deps.map(function(dep){
      return meshes[dep]
    })
    //.filter(x=>x!==undefined)
    .reduce(function(acc,cur){
      console.log("reduce",acc,cur)
      return visualCallback(cur)
    })*/
  

}

export function makeNoteVisual(core, meshes){
  console.log("makeNoteVisual",core, meshes)
  let point = core.target.point
  let deps  = [core.target.id]

  function visual(object){
    //mesh.updateMatrix()
    //mesh.updateMatrixWorld()
    let pt = new THREE.Vector3().fromArray(point)//.add(mesh.position)
    pt     = object.localToWorld(pt)

    let params = {
      point:pt,
      object}
    params = mergeData(params,annotStyle)

    return new annotations.NoteVisual(params)
  }

  return resolveMeshes(deps, visual, meshes)
}
