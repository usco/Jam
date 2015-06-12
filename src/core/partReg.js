import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

import logger from 'log-minim'
let log = logger("app")
log.setLevel("debug")

import {generateUUID} from 'usco-kernel2/src/utils'


const defaults = {
  partTypes:[],
  meshNameToPartTypeUId:{},
  typeUidToMeshName:{},
  latest:undefined
}

function makeModifications(intent){
  let bla$ = intent.combos$
    .map((data) => (regData) => {

      console.log("I would register something", data, regData)
      //let {partKlass,typeUid}    = self.kernel.registerPartType( null, null, mesh, {name:resource.name, resource:resource} )
      //addEntityType$( {type:partKlass,typeUid} )

      //we do not return the shape since that becomes the "reference shape/mesh", not the
      //one that will be shown
      //return partKlass

      let partTypes = regData.partTypes || []
      let meshNameToPartTypeUId = regData.meshNameToPartTypeUId || {}
      let typeUidToMeshName = regData.typeUidToMeshName || {}

      let meshName = data.resource.name || ""
      let typeUid = meshNameToPartTypeUId[ meshName ]
      //no typeUid was given, it means we have a mesh with no part (yet !)
      if( !typeUid ) {
        typeUid = generateUUID()
        
        //create ...
        //partKlass = this.makeNamedPartKlass( cName, typeUid )
        //& register class
        //this.registerPartType( partKlass, cName, typeUid )
        //this.partTypes[ typeUid ]     = partKlass
        //this.partTypesByName[ cName ] = partKlass
        
        //TODO: move this to a visual specific part of the code
        partTypes.push(typeUid)
        meshNameToPartTypeUId[meshName] = typeUid
        typeUidToMeshName[typeUid] = meshName
      } 

      return {partTypes, meshNameToPartTypeUId,typeUidToMeshName, latest:typeUid}
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