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
  latest:undefined
}

function makeModifications(intent){
  let bla$ = intent.combos$
    .map((data) => (regData) => {

      console.log("I would register something", data, regData)

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

      //no typeUid was given, it means we have a mesh with no part (yet !)
      if( !typeUid ) {
        typeUid = generateUUID()

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
      } 

      return {
        partTypes, 
        meshNameToPartTypeUId,
        typeUidToMeshName, 
        typeData,
        latest:typeUid}
  })

  

  return merge(
    bla$
  )
}

function model(intent, source) {
  let source$ = source || Observable.just(defaults)
  
  let modification$ = makeModifications(intent)

  return modification$
    .merge(source$)
    .scan((regData, modFn) => modFn(regData))//combine existing data with new one
    .shareReplay(1)
}

export default model