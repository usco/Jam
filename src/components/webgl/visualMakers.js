import {annotations} from 'glView-helpers'
//const annotations = helpers.annotations
import THREE from 'three'
import assign from 'fast.js/object/assign'//faster object.assign

import {mergeData} from '../../utils/modelUtils'


import {find,propEq} from 'ramda'


  let annotStyle = {
    crossColor:"#000",
    textColor:"#000",
    lineColor:"#000",
    arrowColor:"#000",
    lineWidth:2.2,
    highlightColor: "#60C4F8",//"#00F",
    fontFace:"Open Sans"
  }

function resolveMeshes(deps, meshes){
  return deps.map(function(dep){
      return meshes[dep]
    })
    .filter(x=>x!==undefined)
}

function addCoreData(core,visual){
  visual.userData.entity = {id : core.id}
  //special attributes
  visual.pickable = true
  return visual
}

function combineData(core, deps, meshes, makeVisual){
  const depMeshes = resolveMeshes(deps, meshes) 
  const visual    = makeVisual(depMeshes)
  return addCoreData(core, visual)
}

//actual visual makers

export function makeNoteVisual(core, meshes){
  console.log("makeNoteVisual",core, meshes)
  let point = core.target.point
  let deps  = [core.target.id]

  function makeVisual([object]){
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

  return combineData(core, deps, meshes, makeVisual)
}



export function makeDistanceVisual(core, meshes){
  let start = core.target.start
  let end = core.target.end

  let deps = [start.id, end.id]

  function makeVisual([startMesh, endMesh]){
    let startPt = new THREE.Vector3().fromArray(start.point)
    let endPt   = new THREE.Vector3().fromArray(end.point)
    startMesh.localToWorld(startPt)
    endMesh.localToWorld(endPt)
    //startMesh.worldToLocal(startPt)
    //endMesh.worldToLocal(endPt)

    let params = {
      start:startPt,
      startObject:startMesh,
      end: endPt,
      endObject: endMesh
    }
    params = mergeData(params, annotStyle)

    return new annotations.DistanceVisual(params)
  }

  return combineData(core, deps, meshes, makeVisual)
}

export function makeThicknessVisual(core, meshes){
  let deps = [core.target.id]
  let entryPoint = core.target.entryPoint
  let exitPoint  = core.target.exitPoint
                    
  function makeVisual([object]){

    entryPoint= new THREE.Vector3().fromArray(entryPoint)
    exitPoint = new THREE.Vector3().fromArray(exitPoint)
    entryPoint = object.localToWorld(entryPoint)
    exitPoint = object.localToWorld(exitPoint)

    let params = {
      entryPoint,
      exitPoint,
      object
    }
    params = mergeData(params,annotStyle)
    return new annotations.ThicknessVisual(params)
  }

  return combineData(core, deps, meshes, makeVisual)
}


export function makeDiameterVisual(core, meshes){
  let point = core.target.point
  let normal = core.target.normal
  let diameter = core.value
  let deps = [core.target.id]
  
  function makeVisual([mesh]){
    point    = new THREE.Vector3().fromArray(point)
    normal   = new THREE.Vector3().fromArray(normal)
    //mesh.updateMatrix()
    //mesh.updateMatrixWorld()
    point = mesh.localToWorld(point)

    let params = {
         center:point,
         diameter,
         orientation:normal
      }
    params = assign(params,annotStyle)

    return new annotations.DiameterVisual(params)
  }
     
  return combineData(core, deps, meshes, makeVisual)
}


export function makeAngleVisual(core, meshes){
  let start = core.target.start
  let mid   = core.target.mid
  let end   = core.target.end
  let angle = core.value

  let deps = [start, mid, end].map(d=>d.id)
  console.log("makeAngleVisual",core, params)
  
  function makeVisual([startObject, midObject, endObject]){
    let startPt = new THREE.Vector3().fromArray(start.point)
    let midPt   = new THREE.Vector3().fromArray(mid.point)
    let endPt   = new THREE.Vector3().fromArray(end.point)


    let params = {
         start:startPt
         ,mid:midPt
         ,end:endPt

         ,startObject
         ,midObject
         ,endObject

         ,angle
      }
    params = assign(params,annotStyle)

    return new annotations.AngleVisual(params)
  }
     
  return combineData(core, deps, meshes, makeVisual)
}