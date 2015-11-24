import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from 'log-minim'
let log = logger("app")
log.setLevel("debug")

import {generateUUID} from '../../utils/utils'
import {nameCleanup} from '../../utils/formatters'
import {computeBoundingBox,computeBoundingSphere} from 'glView-helpers/src/meshTools/computeBounds'
import {makeModel, mergeData} from '../../utils/modelUtils'


function typeUidFromMeshName(meshNameToPartTypeUId, meshName){
  return meshNameToPartTypeUId[ meshName ]
}

function typeFromMeshData(data, typeUidFromMeshName){
  console.log("typeFromMeshData",data)
  let meshName = data.meta.name || ""
  let name     = nameCleanup(meshName)

  let id = typeUidFromMeshName(meshName)
  let templateMesh = undefined
  let printable    = true

  //no id was given, it means we have a mesh with no entity (yet !)
  if( !id ) {
    id = generateUUID()
    //extract usefull information
    //we do not return the shape since that becomes the "reference shape/mesh", not the
    //one that will be shown
    let mesh = data.data

    templateMesh = mesh
    computeBoundingSphere(templateMesh)
    computeBoundingBox(templateMesh)
  }

  return {id, name, meshName, templateMesh, printable } 
}

function updateTypesData(newTypeData, currentData){
  //save new data
  let regData = currentData//.asMutable() //FIXME ...errr
  let {id, name, meshName,templateMesh} = newTypeData
  
  let typeData              = regData.typeData//.asMutable()
  let meshNameToPartTypeUId = regData.meshNameToPartTypeUId//.asMutable()
  let typeUidToMeshName     = regData.typeUidToMeshName//.asMutable()
  let typeUidToTemplateMesh = regData.typeUidToTemplateMesh//.asMutable()

  if(id && meshName && templateMesh){
    typeUidToMeshName[id]      = meshName
    typeUidToTemplateMesh[id]  = templateMesh
    meshNameToPartTypeUId[meshName] = id

    typeData[id]={
      id
      ,name
    }
  }

  return {
    meshNameToPartTypeUId,
    typeUidToMeshName, 
    typeUidToTemplateMesh,

    typeData
  }
}

/////////////////
//actual api functions 

function registerTypeFromMesh(state,input){
  //log.info("I would register something", state, input)
  console.log("I would register something", state, input)

  //prepare lookup function for finding already registered meshes
  let typeUidLookup = typeUidFromMeshName.bind(null,state.meshNameToPartTypeUId)
  //create new data
  let newData = typeFromMeshData(input, typeUidLookup)
  //update data
  return updateTypesData(newData,state)
}

function clearTypes(state, input){
  //log.info("New design, clearing registry",regData)
  return mergeData(defaults)
}

function entityTypes(actions, source){
  const defaults = {
    meshNameToPartTypeUId:{},
    typeUidToMeshName:{},
    typeData:{},
    
    //not sure
    typeUidToTemplateMesh:{}
  }

  let updateFns  = {registerTypeFromMesh, clearTypes}
  return makeModel(defaults, updateFns, actions, undefined, {doApplyTransform:false})//since we store meshes, we cannot use immutable data
}

export default entityTypes