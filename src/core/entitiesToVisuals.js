
//required "semi hack"
function getEntityByIuid(iuid){
  let entitiesByIuids =
  {
    5:{typeUid:"A0",iuid:5,name:"PART1",pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]},
    2: {typeUid:"A0",iuid:2,name:"PART2",pos:[0,0,40],rot:[0,45,0],sca:[1,1,1]},
    7: {typeUid:"A0",iuid:7,name:"PART3",pos:[10,-20,0],rot:[0,0,0],sca:[1,1,1]},


    10:{typeUid:"A1",iuid:10,name:"ANNOT3",deps:[5,2,7],                     pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]},
    11:{typeUid:"A2",iuid:11,name:"Note ANNOT",value:"some text", deps:[2],  pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
      target:{point:[10,5,0],iuid:2}
    },
  }

  return entitiesByIuids[iuid]
}


  
//mesh insertion post process
export function meshInjectPostProcess( mesh ){
  //FIXME: not sure about these, they are used for selection levels
  mesh.selectable      = true
  mesh.selectTrickleUp = false
  mesh.transformable   = true
  //FIXME: not sure, these are very specific for visuals
  mesh.castShadow      = true
  //mesh.receiveShadow = true
  return mesh
}

export function applyEntityPropsToMesh( inputs ){
  let {entity, mesh} = inputs
  mesh.userData.entity = entity//FIXME : should we have this sort of backlink ?
  //FIXME/ make a list of all operations needed to be applied on part meshes
  //computeObject3DBoundingSphere( meshInstance, true )
  //centerMesh( meshInstance ) //FIXME do not use the "global" centerMesh
  mesh.position.fromArray( entity.pos )
  mesh.rotation.fromArray( entity.rot )
  mesh.scale.fromArray(  entity.sca )
  mesh.material.color.set( entity.color )
  return mesh
}


function meshesFromDeps(deps, getVisual){
  let observables = deps//entity.deps
    .map(getEntityByIuid)
    .map(getVisual)
    .map(s=>s.take(1))//only need one, also, otherwise, forkjoin will not fire

  return Rx.Observable.forkJoin( observables )    
    //.subscribe(function(vO){
}


/*provides visual mapping to "arbitrary" 3d meshes*/
function remoteMeshVisualProvider(entity, subJ, getVisual, types$){
  //console.log("return mesh")
  types$.subscribe(
    function(types){
      //console.log("TYPES",types)
      let mesh = types.typeUidToTemplateMesh[entity.typeUid]
      if(mesh){
        mesh = mesh.clone()
        mesh = meshInjectPostProcess(mesh)
        mesh = applyEntityPropsToMesh({entity,mesh})
        subJ.onNext(mesh)
      }
    },e=>console.error(e))
  //subJ.onCompleted("mesh completed")
}

/*this one is used for "static"/pre determined visuals, like for annotations*/
function staticVisualProvider(entity, subJ, getVisual){
  console.log("staticVisualProvider",entity,subJ)

  meshesFromDeps(entity.deps, getVisual)
    .subscribe(function(vO){
      console.log("parallel observables result",vO)
      //vO.subscribe(function(depMesh){
        subJ.onNext("in progress static for "+entity.name+" based on "+entity.deps)
      //}) 
    },e=>console.log("error",e),e=>console.log("DONE with observables"))
}


//wrapper function
export function createVisualMapper(types$){

  //ugh !! this is needed to be OUTSIDE the scope of "getVisual" otherwise, each call returns a new instance
  //of the cache : ie NO CACHE
  let iuidToMesh = {}
  let typeUidToTemplateMesh = {}

  function getVisual2(entity){
    console.log("getting visual")
    
    //now each resolver that it applies to needs to fire "onNext on this subject"
    let subJ = new Rx.ReplaySubject()

    let {iuid, typeUid} = entity
   
    //what we want as "user" is a refined, updated result
    //note: is this always the case or only with geometry?
    function mod(mesh){
      console.log("oh great a mesh to change")
      return mesh
    }

    function cache(mesh){
      //needed ?
      if(!iuidToMesh[iuid]){
        console.log("caching mesh",mesh, "total cache",iuidToMesh)
        iuidToMesh[entity.iuid] = mesh
      }
    }

    if(!iuidToMesh[iuid]){
      //entity.filter(e=> types.indexOf(x.type) > -1 )
      if(entity.typeUid === "A0") remoteMeshVisualProvider(entity,subJ, getVisual2,types$)
      if(entity.typeUid === "A1") staticVisualProvider(entity,subJ, getVisual2)    
    }else{
      console.log("reusing mesh from cache by iuid",iuid)
      subJ.onNext(iuidToMesh[iuid])
    }

    return subJ.do(cache).map(mod)
  }

  return getVisual2
}


function makeNoteVisual(entry, entity){
  let annotStyle = {
    crossColor:"#000",
    textColor:"#000",
    lineColor:"#000",
    arrowColor:"#000",
    lineWidth:2.2,
    highlightColor: "#60C4F8",//"#00F",
    fontFace:"Open Sans"
  }

  console.log("note annot",entry)

  let point = entry.target.point
  let deps = [entry.target.iuid]

  
  //mesh.updateMatrix()
  //mesh.updateMatrixWorld()
  let pt = new THREE.Vector3().fromArray(point)//.add(mesh.position)
  pt = mesh.localToWorld(pt)

  let params = {
    point:pt,
    object:mesh}
  params = Object.assign(params,annotStyle)
  
  visual = new annotations.NoteVisual(params)

}


//annotations require 1...n preloaded meshes
//how about sorting them by required meshes?
//alt: promises

/*
 //for annotations, overlays etc
  function annotationVisualProvider(entity)
  {
    //console.log("drawing metadata",data)
    let annotStyle = {
      crossColor:"#000",
      textColor:"#000",
      lineColor:"#000",
      arrowColor:"#000",
      lineWidth:2.2,
      highlightColor: "#60C4F8",//"#00F",
      fontFace:"Open Sans"
    }

    let visual = undefined
    if(entry.typeUid === "0"){
      console.log("note annot",entry)

      let point = entry.target.point
      let entity = data.filter(function(data){return data.iuid === entry.target.iuid})
      entity = entity.pop()

      if(!entity) return
      let mesh = __localCache[entity.iuid]
      if(!mesh) return

      //mesh.updateMatrix()
      //mesh.updateMatrixWorld()
      let pt = new THREE.Vector3().fromArray(point)//.add(mesh.position)
      pt = mesh.localToWorld(pt)

      let params = {
        point:pt,
        object:mesh}
      params = Object.assign(params,annotStyle)
      
      visual = new annotations.NoteVisual(params)
    }

    if(entry.typeUid === "1"){
      //Thickness
      let entity = data.filter(function(data){return data.iuid === entry.target.iuid})
      entity = entity.pop()

      if(!entity) return
      let mesh = __localCache[entity.iuid]
      if(!mesh) return

      let entryPoint = entry.target.entryPoint
      let exitPoint  = entry.target.exitPoint
                    
      entryPoint= new THREE.Vector3().fromArray(entryPoint)//.add(mesh.position)
      exitPoint = new THREE.Vector3().fromArray(exitPoint)

      entryPoint = mesh.localToWorld(entryPoint)
      exitPoint = mesh.localToWorld(exitPoint)

      let params = {
        entryPoint,
        exitPoint,
        object:mesh
      }
      params = Object.assign(params,annotStyle)
      visual = new annotations.ThicknessVisual(params)
    }

    if(entry.typeUid === "2"){
      //distance
      let start = entry.target.start
      let startEntity = data.filter(function(data){return data.iuid === start.iuid})
      startEntity = startEntity.pop()

      let end = entry.target.end
      let endEntity = data.filter(function(data){return data.iuid === end.iuid})
      endEntity = endEntity.pop()

      if(!startEntity || !endEntity) return

      let startMesh = __localCache[startEntity.iuid]
      let endMesh   = __localCache[endEntity.iuid]
      if( startMesh && endMesh ){
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
        params = Object.assign(params, annotStyle)

        visual = new annotations.DistanceVisual(params)
      }            
    }

    if(entry.typeUid === "3"){
      //diameter
      console.log("diameter annot",entry)

      let point = entry.target.point
      let entity = data.filter(function(data){return data.iuid === entry.target.iuid})
      entity = entity.pop()

      if(!entity) return
      let mesh = __localCache[entity.iuid]
      if(!mesh) return

      //mesh.updateMatrix()
      //mesh.updateMatrixWorld()
      point        = new THREE.Vector3().fromArray(point)
      let normal   = new THREE.Vector3().fromArray(entry.target.normal)
      let diameter = entry.value
     
      if(!entity) return

      point = mesh.localToWorld(point)

      let params = {
         center:point,
         diameter,
         orientation:normal
      }
      params = Object.assign(params,annotStyle)

      visual = new annotations.DiameterVisual(params)
  
    }

    if(visual){
      visual.userData.entity = entry
      dynamicInjector.add( visual )
    }
      return visual
  })*/
