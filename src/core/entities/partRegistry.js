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



function typeUidFromMeshName(meshName){

  return meshNameToPartTypeUId[ meshName ]
}


function typeFromMeshData(data){
  let typeData = regData.typeData || {}

  let meshName      = data.resource.name || ""
  let cleanedName   = nameCleanup(meshName)

  let typeUid = typeUidFromMeshName(meshName)

  //no typeUid was given, it means we have a mesh with no part (yet !)
  if( !typeUid ) {
    typeUid = generateUUID()

    //extract usefull information
    let templateMesh = data.mesh
    computeBoundingSphere(templateMesh)
    computeBoundingBox(templateMesh)

    typeData[typeUid]={
      name:cleanedName,
      bbox:{
        min: templateMesh.boundingBox.min.toArray(),
        max: templateMesh.boundingBox.max.toArray()
      }
    }
  }

    return {typeUid, meshName, templateMesh}

}

function updateTypesData(newTypeData, currentData){
  //save new data
  let regData = currentData
  //partKlass = this.makeNamedPartKlass( cleanedName, typeUid )
  //& register class
  let meshNameToPartTypeUId = regData.meshNameToPartTypeUId || {}
  let typeUidToMeshName = regData.typeUidToMeshName || {}
  let typeUidToTemplateMesh = regData.typeUidToTemplateMesh || {}

  meshNameToPartTypeUId[meshName] = typeUid
  typeUidToMeshName[typeUid] = meshName
  typeUidToTemplateMesh[typeUid] = mesh
}



function modifications(intent){

  let registerTypeFromMesh$ = intent.combos$
    .map((data) => (regData) => {
      log.info("I would register something", data, regData)

      //we do not return the shape since that becomes the "reference shape/mesh", not the
      //one that will be shown
      //return partKlass
      let meshNameToPartTypeUId = regData.meshNameToPartTypeUId || {}
      let typeUidToMeshName = regData.typeUidToMeshName || {}
      let typeData = regData.typeData || {}

      let meshName      = data.resource.name || ""
      let cleanedName   = nameCleanup(meshName)
      let typeUid = meshNameToPartTypeUId[ meshName ]

      let typeUidToTemplateMesh = regData.typeUidToTemplateMesh || {}

      //no typeUid was given, it means we have a mesh with no part (yet !)
      if( !typeUid ) {
        typeUid = generateUUID()
        //typeUid = "A0"

        //extract usefull information
        let mesh = data.mesh
        computeBoundingSphere(mesh)
        computeBoundingBox(mesh)
        typeData[typeUid]={
          name:cleanedName,
          bbox:{
            min: mesh.boundingBox.min.toArray(),
            max: mesh.boundingBox.max.toArray()
          }
        }
        //console.log("mesh bb",mesh.boundingBox)
        
        //create ...
        //partKlass = this.makeNamedPartKlass( cleanedName, typeUid )
        //& register class
        meshNameToPartTypeUId[meshName] = typeUid
        typeUidToMeshName[typeUid] = meshName

        typeUidToTemplateMesh[typeUid] = mesh
      } 

      return {
        meshNameToPartTypeUId,
        typeUidToMeshName, 
        typeData,
        latest:typeUid,

        typeUidToTemplateMesh
      }
  })


  /*reset all the data to nothing*/
  let reset$ = intent.reset$
    .map(() => (regData) => {
      log.info("New design, clearing registry",regData)
      return Object.assign({},defaults)
  })
  

  return merge(
    registerTypeFromMesh$
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