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
  partTypes:[],
  meshNameToPartTypeUId:{},
  typeUidToMeshName:{},
  typeData:{},
  latest:undefined,

  //not sure
  typeUidToTemplateMesh:{}
}

function makeModifications(intent){
  let registerTypeFromMesh$ = intent.combos$
    .map((data) => (regData) => {
      log.info("I would register something", data, regData)

      //we do not return the shape since that becomes the "reference shape/mesh", not the
      //one that will be shown
      //return partKlass

      let partTypes = regData.partTypes || []
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
        
        partTypes.push(typeUid)
        meshNameToPartTypeUId[meshName] = typeUid
        typeUidToMeshName[typeUid] = meshName

        typeUidToTemplateMesh[typeUid] = mesh
      } 

      return {
        partTypes, 
        meshNameToPartTypeUId,
        typeUidToMeshName, 
        typeData,
        latest:typeUid,

        typeUidToTemplateMesh
      }
  })


  /*technically same as deleteAll , but kept seperate for clarity*/
  let clearData$ = intent.deleteAllEntities$
    .map(() => (regData) => {
      log.info("New design, clearing registry",regData)
      return Object.assign({},defaults)
      //return regData
  })
  

  return merge(
    registerTypeFromMesh$
    ,clearData$
  )
}

function partReg(intent, source) {
  let source$ = source || Observable.just(defaults)
  
  let modification$ = makeModifications(intent)

  return modification$
    .merge(source$)
    .scan((regData, modFn) => modFn(regData))//combine existing data with new one
    .shareReplay(1)
}

export default partReg