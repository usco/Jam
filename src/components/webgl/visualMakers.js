import { annotations } from 'glView-helpers'
// const annotations = helpers.annotations
import THREE from 'three'
import assign from 'fast.js/object/assign' // faster object.assign
import { mergeData } from '../../utils/modelUtils'

let annotStyle = {
  crossColor: '#000',
  textColor: '#000',
  lineColor: '#000',
  arrowColor: '#000',
  lineWidth: 2.2,
  highlightColor: '#60C4F8', // "#00F",
  fontFace: 'Open Sans'
}

function resolveMeshes (deps, meshes) {
  return deps.map(function (dep) {
    return meshes[dep]
  })
    .filter(x => x !== undefined)
}

function addMetaData (meta, visual) {
  visual.userData.entity = {id: meta.id}
  // special attributes
  visual.pickable = true
  return visual
}

function combineData (meta, deps, meshes, makeVisual) {
  const depMeshes = resolveMeshes(deps, meshes)
  const visual = makeVisual(depMeshes)
  return addMetaData(meta, visual)
}

// actual visual makers

export function makeNoteVisual (meta, meshes) {
  console.log('makeNoteVisual', meta, meshes)
  let point = meta.target.point
  let deps = [meta.target.id]

  function makeVisual ([object]) {
    // mesh.updateMatrix()
    // mesh.updateMatrixWorld()
    let pt = new THREE.Vector3().fromArray(point) // .add(mesh.position)
    pt = object.localToWorld(pt)

    let params = {
      point: pt,
      object
    }
    params = mergeData(params, annotStyle)

    return new annotations.NoteVisual(params)
  }

  return combineData(meta, deps, meshes, makeVisual)
}

export function makeDistanceVisual (meta, meshes) {
  let start = meta.target.start
  let end = meta.target.end

  let deps = [start.id, end.id]

  function makeVisual ([startMesh, endMesh]) {
    let startPt = new THREE.Vector3().fromArray(start.point)
    let endPt = new THREE.Vector3().fromArray(end.point)
    startMesh.localToWorld(startPt)
    endMesh.localToWorld(endPt)
    // startMesh.worldToLocal(startPt)
    // endMesh.worldToLocal(endPt)

    let params = {
      start: startPt,
      startObject: startMesh,
      end: endPt,
      endObject: endMesh
    }
    params = mergeData(params, annotStyle)

    return new annotations.DistanceVisual(params)
  }

  return combineData(meta, deps, meshes, makeVisual)
}

export function makeThicknessVisual (meta, meshes) {
  let deps = [meta.target.id]
  let entryPoint = meta.target.entryPoint
  let exitPoint = meta.target.exitPoint

  function makeVisual ([object]) {
    entryPoint = new THREE.Vector3().fromArray(entryPoint)
    exitPoint = new THREE.Vector3().fromArray(exitPoint)
    entryPoint = object.localToWorld(entryPoint)
    exitPoint = object.localToWorld(exitPoint)

    let params = {
      entryPoint,
      exitPoint,
      object
    }
    params = mergeData(params, annotStyle)
    return new annotations.ThicknessVisual(params)
  }

  return combineData(meta, deps, meshes, makeVisual)
}

export function makeDiameterVisual (meta, meshes) {
  let point = meta.target.point
  let normal = meta.target.normal
  let diameter = meta.value
  let deps = [meta.target.id]

  function makeVisual ([mesh]) {
    point = new THREE.Vector3().fromArray(point)
    normal = new THREE.Vector3().fromArray(normal)
    // mesh.updateMatrix()
    // mesh.updateMatrixWorld()
    point = mesh.localToWorld(point)

    let params = {
      center: point,
      diameter,
      orientation: normal
    }
    params = assign(params, annotStyle)

    return new annotations.DiameterVisual(params)
  }

  return combineData(meta, deps, meshes, makeVisual)
}

export function makeAngleVisual (meta, meshes) {
  let start = meta.target.start
  let mid = meta.target.mid
  let end = meta.target.end
  let angle = meta.value

  let deps = [start, mid, end].map(d => d.id)

  function makeVisual ([startObject, midObject, endObject]) {
    let startPt = new THREE.Vector3().fromArray(start.point)
    let midPt = new THREE.Vector3().fromArray(mid.point)
    let endPt = new THREE.Vector3().fromArray(end.point)

    let params = {
      start: startPt,
      mid: midPt,
      end: endPt,
      startObject,
      midObject,
      endObject,
      angle}
    params = assign(params, annotStyle)

    return new annotations.AngleVisual(params)
  }

  return combineData(meta, deps, meshes, makeVisual)
}
