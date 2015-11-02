import helpers from 'glView-helpers'
let annotations = helpers.annotations
import THREE from 'three'

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

function makeNoteVisual(entity, subJ, params){
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
    params = Object.assign(params,annotStyle)

    return new annotations.NoteVisual(params)
  }

  meshesFromDeps(deps, getVisual, entities$)
    .subscribe(function(data){
      subJ.onNext(visual(data[0]))
    })
}



function resolveMeshes(deps, visualCallback, core){

}

export function foo(core){
  let point = core.target.point
  let deps  = [core.target.id]

  function visual(mesh){
    //mesh.updateMatrix()
    //mesh.updateMatrixWorld()
    let pt = new THREE.Vector3().fromArray(point)//.add(mesh.position)
    pt     = mesh.localToWorld(pt)

    let params = {
      point:pt,
      object:mesh}
    params = Object.assign(params,annotStyle)

    return new annotations.NoteVisual(params)
  }


}
