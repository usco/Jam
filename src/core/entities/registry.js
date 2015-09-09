import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from 'log-minim'
let log = logger("app")
log.setLevel("debug")

import {generateUUID, nameCleanup} from 'usco-kernel2/src/utils'
import {computeBoundingBox,computeBoundingSphere} from 'glView-helpers/src/meshTools/computeBounds'

const defaults = {
  meshNameToPartTypeUId:{},
  typeUidToMeshName:{},
  typeData:{},
  latest:undefined,
  //not sure
  typeUidToTemplateMesh:{}
}

function typeUidFromMeshName(meshNameToPartTypeUId, meshName){
  return meshNameToPartTypeUId[ meshName ]
}

function typeFromMeshData(data, typeUidFromMeshName){
  let meshName      = data.resource.name || ""
  let cleanedName   = nameCleanup(meshName)

  let typeUid = typeUidFromMeshName(meshName)
  let templateMesh = undefined

  //no typeUid was given, it means we have a mesh with no part (yet !)
  if( !typeUid ) {
    typeUid = generateUUID()

    //extract usefull information
    //we do not return the shape since that becomes the "reference shape/mesh", not the
    //one that will be shown
    templateMesh = data.mesh
    computeBoundingSphere(templateMesh)
    computeBoundingBox(templateMesh)
  }

  return {typeUid, meshName, templateMesh}
}

function updateTypesData(newTypeData, currentData){
  //save new data
  let regData = currentData
  let {typeUid,meshName,templateMesh} = newTypeData
  
  //partKlass = this.makeNamedPartKlass( cleanedName, typeUid )& register class
  let typeData              = regData.typeData || {}
  let meshNameToPartTypeUId = regData.meshNameToPartTypeUId || {}
  let typeUidToMeshName     = regData.typeUidToMeshName || {}
  let typeUidToTemplateMesh = regData.typeUidToTemplateMesh || {}

  if(typeUid && meshName && templateMesh){
    typeUidToMeshName[typeUid]      = meshName
    typeUidToTemplateMesh[typeUid]  = templateMesh
    meshNameToPartTypeUId[meshName] = typeUid

    //FIXME: duplicate code, needs removal
    let cleanedName   = nameCleanup(meshName)

    typeData[typeUid]={
      name:cleanedName,
      typeUid,
      bbox:{
        min: templateMesh.boundingBox.min.toArray(),
        max: templateMesh.boundingBox.max.toArray()
      }
    }
  }

  return {
    meshNameToPartTypeUId,
    typeUidToMeshName, 
    typeUidToTemplateMesh,

    typeData,
    latest:typeUid
  }
}


function modifications(intent){

  let typeFromMesh$ = intent.combos$
    .map((data) => (regData) => {
      //log.info("I would register something", data, regData)
      //prepare lookup function for finding already registered meshes
      let typeUidLookup = typeUidFromMeshName.bind(null,regData.meshNameToPartTypeUId)
      //create new data
      let newData = typeFromMeshData(data,typeUidLookup)
      //update data
      return updateTypesData(newData,regData)
  })

  /*reset all the data to nothing*/
  let reset$ = intent.reset$
    .map(() => (regData) => {
      //log.info("New design, clearing registry",regData)
      return Object.assign({},defaults)
  })

  return merge(
    typeFromMesh$
    ,reset$
  )
}

function partRegistry(intent, source) {
  let source$ = source || Observable.just(defaults)
  
  let modification$ = modifications(intent)

  return modification$
    .merge(source$)
    .scan((regData, modFn) => modFn(regData))//combine existing data with new one
    .shareReplay(1)
}

export default partRegistry