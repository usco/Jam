import AssetManager from 'usco-asset-manager'
import DesktopStore from 'usco-desktop-store'
import XhrStore     from 'usco-xhr-store'
import StlParser    from 'usco-stl-parser'
import CtmParser    from 'usco-ctm-parser'
import PlyParser    from 'usco-ply-parser'

import Kernel       from 'usco-kernel2'
/////////

import postProcessMesh from '../utils/meshUtils'
import helpers         from 'glView-helpers'
let centerMesh         = helpers.mesthTools.centerMesh
import {generateUUID} from 'usco-kernel2/src/utils'


export function makeInternals(){
  let assetManager = new AssetManager()
  assetManager.addParser("stl", new StlParser())
  assetManager.addParser("ctm", new CtmParser())
  assetManager.addParser("ply", new PlyParser())

  assetManager.addStore( "desktop", new DesktopStore() )
  assetManager.addStore( "xhr"    , new XhrStore() )

  return assetManager
}


export function meshResources(meshSources$, assetManager){
  //experimental 
  let resources$ = meshSources$
    .flatMap(Rx.Observable.fromArray)
    .flatMap(function(dataSource){
      let resource = assetManager.load( dataSource, {keepRawData:true, parsing:{useWorker:true,useBuffers:true} } )
      return Rx.Observable.fromPromise(resource.deferred.promise)
    })
    .shareReplay(1)


  //mesh + resource data together
  let combos$ =
    resources$.map(function(resource){
      console.log("here")
      let mesh = postProcessMesh(resource.data)
      mesh=centerMesh(mesh)
      return {mesh, resource}
    })
    .shareReplay(1)

  return combos$
}


function instanceFromTypeData(name, typeData){
  //let name = 
  let bbox = typeData.bbox
  let h = bbox.max[2]  - bbox.min[2]

  let instance =
  {
      name: name,
      iuid: generateUUID(),
      typeUid: typeData.typeUid,
      cid:0,//categoryId
      color: "#07a9ff",
      pos: [0,0,h/2],
      rot: [0,0,0],
      sca: [1,1,1],
      bbox:bbox
  }

  return instance
}

export function entityInstanceFromPartTypes(partTypes$)
{
  //alternative
  return partTypes$
    .skip(1)
    .map(function(partTypes){
      let idx = 0//Object.keys(entities.byId).length  
      let typeUid = partTypes.latest
      if( typeUid ){
        let name = partTypes.typeUidToMeshName[typeUid]+idx
        let typeData = partTypes.typeData[typeUid]
        if(typeData){
          return instanceFromTypeData(name,typeData)
        }
      }
    })
}