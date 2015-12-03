
/////////
import postProcessMesh from '../utils/meshUtils'
//import helpers         from 'glView-helpers'
//let centerMesh         = helpers.mesthTools.centerMesh

export function makeInternals(){
  //let assetManager = new AssetManager()
  /*assetManager.addParser("stl", new StlParser())
  assetManager.addParser("ctm", new CtmParser())
  assetManager.addParser("ply", new PlyParser())

  assetManager.addStore( "desktop", new DesktopStore() )
  assetManager.addStore( "xhr"    , new XhrStore() )*/

  return {}
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
      let mesh = postProcessMesh(resource.data)
      mesh=centerMesh(mesh)
      return {mesh, resource}
    })
    .shareReplay(1)

  return combos$
}
