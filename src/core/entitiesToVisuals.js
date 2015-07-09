
//required "semi hack"
function getEntityByIuid(iuid){
  let entitiesByIuids =
  {
    5:{typeUid:0,iuid:5,name:"PART1"},
    10:{typeUid:1,iuid:10,name:"ANNOT3",deps:[5,2,7]},

    2:{typeUid:0,iuid:2,name:"PART2"},
    7:{typeUid:0,iuid:7,name:"PART3"},
  }

  return entitiesByIuids[iuid]
}

function remoteMeshVisualProvider(entity, subJ, getVisual){
  //console.log("return mesh")
  let typeUidToTemplateMesh = {}
  
  /*if(!typeUidToTemplateMesh)
  {
    let mesh = types.typeUidToTemplateMesh[entity.typeUid].clone() 
  }
  let mesh = types.typeUidToTemplateMesh[entity.typeUid].clone() 
  mesh = meshInjectPostProcess(mesh)
  subJ.onNext("in progress mesh for "+entity.name)*/

  subJ.onNext("in progress mesh for "+entity.name)
  //subJ.onCompleted("mesh completed")
}

function staticVisualProvider(entity, subJ, getVisual){
  //console.log("staticVisualProvider",entity,subJ)

  let observables = entity.deps
    .map(getEntityByIuid)
    .map(getVisual)

    //.map( d=> Rx.Observable.just(d) ) 

  /*console.log("observables",observables)
  observables[0].subscribe(e=>console.log("first observable"))
  observables[1].subscribe(e=>console.log("second observable"))
  observables[2].subscribe(e=>console.log("third observable"))*/


  Rx.Observable.forkJoin( observables )    
    
    .subscribe(function(vO){
      console.log("parallel observables result",vO)
      //vO.subscribe(function(depMesh){
        subJ.onNext("in progress static for "+entity.name+" based on "+entity.deps)
      //}) 
    },e=>console.log("error",e),e=>console.log("DONE with observables"))
}


//wrapper function
export function createVisualMapper(types){

  //ugh !! this is needed to be OUTSIDE the scope of "getVisual" otherwise, each call returns a new instance
  //of the cache : ie NO CACHE
  let iuidToMesh = {}
  let typeUidToTemplateMesh = {}

  function getVisual2(entity){
    console.log("getting visual")
    
    let subJ = new Rx.ReplaySubject()

    let {iuid, typeUid} = entity
    //now each resolver that it applies to needs to fire "onNext on this subject"

    //what we want as "user" is a refined, updated result
    //note: is this always the case or only with geometry?
    function mod(mesh){
      console.log("oh great a mesh to change")
      return mesh //applyEntityPropsToMesh({entity,mesh})
    }

    function cache(mesh){
      //needed ?
      if(!iuidToMesh[iuid]){
        console.log("caching mesh",mesh)
        iuidToMesh[entity.iuid] = mesh
      }
    }

    if(!iuidToMesh[iuid]){
      //entity.filter(e=> types.indexOf(x.type) > -1 )
      if(entity.typeUid === 0) remoteMeshVisualProvider(entity,subJ, getVisual2)
      if(entity.typeUid === 1) staticVisualProvider(entity,subJ, getVisual2)    
    }else{
      console.log("reusing mesh from cache by iuid",iuid)
      subJ.onNext(iuidToMesh[iuid])
    }

    return subJ.do(cache).map(mod)
  }

  return getVisual2
}


/*
//for "remote/dynamic visuals"
  function remoteMeshVisualProvider(entity, types){
    let {iuid, typeUid} = entity

    if(!iuidToMesh[iuid])
    {
     
      let mesh = types.typeUidToTemplateMesh[entity.typeUid].clone() 
      mesh = meshInjectPostProcess(mesh)
      
      iuidToMesh[typeUid] = mesh
    }else{
      mesh = iuidToMesh[typeUid]
    }

    mesh = applyEntityPropsToMesh({entity,mesh})
  }
*/
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
