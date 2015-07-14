import helpers from 'glView-helpers'
let annotations = helpers.annotations
import THREE from 'three'

//method to filter the source data by types : types are arrays of typeUids
export function obsByTypes(srcData, types){
  return srcData
    .flatMap(function(items){
      //console.log("items",items)
      return Rx.Observable.from(items)
    })
    .filter(x=> types.indexOf(x.type) > -1 )
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
  mesh.position.fromArray( entity.pos )
  mesh.rotation.fromArray( entity.rot )
  mesh.scale.fromArray(  entity.sca )
  mesh.material.color.set( entity.color )
  return mesh
}

function meshesFromDeps(deps, getVisual, entities$){
  /*let observables = deps
    .map(getEntityByIuid)
    .map(getVisual)
    .map(s=>s.take(1))//only need one, also, otherwise, forkjoin will not fire
  //return Rx.Observable.forkJoin( observables )*/

  return Rx.Observable.just(null)//how can I not use this one ?
    .combineLatest(entities$.pluck("byId"),function(x,byId){
      //console.log("byId",byId,deps)
      return deps
        .map(d=>byId[d])
        .filter(x=>x!==undefined)
        .map(getVisual)
        .map(s=>s.take(1))
    })
    .do(e=>console.log("got some data",e))
    .flatMap(Rx.Observable.forkJoin)
    .do(e=>console.log("got some data2",e))
    //.subscribe(x=>console.log("deps",x))

  
}


/*provides visual mapping to "arbitrary" 3d meshes*/
function remoteMeshVisualProvider(entity, subJ, params){
  let {types$} = params
  //console.log("return mesh")
  types$.subscribe(
    function(types){
      //console.log("TYPES",types)
      let originalMesh = types.typeUidToTemplateMesh[entity.typeUid]
      if(originalMesh){
        let mesh = originalMesh.clone()
        let material = originalMesh.material.clone()

        mesh.boundingBox = originalMesh.boundingBox //because clone() does not clone custom attributes
        mesh.boundingSphere = originalMesh.boundingSphere
        mesh.material = material

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
      subJ.onNext("in progress static for "+entity.name+" based on "+entity.deps)
    },e=>console.log("error",e),e=>console.log("DONE with observables"))
}


//wrapper function
export function createVisualMapper(types$, entities$){

  //ugh !! this is needed to be OUTSIDE the scope of "getVisual" otherwise, each call returns a new instance
  //of the cache : ie NO CACHE
  let iuidToMesh = {}
  let typeUidToTemplateMesh = {}
  let visualProviders = {}

  visualProviders["A0"] = remoteMeshVisualProvider //(entity, subJ, getVisual, types$)
  visualProviders["A1"] = noteVisualProvider //(entity, subJ, getVisual, entities$) 
  visualProviders["A2"] = thicknessVisualProvider //(entity, subJ, getVisual, entities$) 
  visualProviders["A3"] = diameterVisualProvider //(entity, subJ, getVisual, entities$) 
  visualProviders["A4"] = distanceVisualProvider //(entity, subJ, getVisual, entities$) 

  function getVisual(entity){
    console.log("getting visual")
    
    //now each resolver  needs to fire "onNext on this subject"
    let subJ = new Rx.ReplaySubject()
    let {iuid, typeUid} = entity
   
    //what we want as "user" is a refined, updated result
    //note: is this always the case or only with geometry?
    function mod(mesh){
      console.log("oh great a mesh to change")
      return mesh
    }

    function cache(mesh){
      if(!iuidToMesh[iuid]){//needed ?
        console.log("caching mesh",mesh, "total cache",iuidToMesh)
        iuidToMesh[entity.iuid] = mesh
      }
    }

    if(!iuidToMesh[iuid]){
      let entities = [entity]
      let typeUid = entity.typeUid
      let visualProvider = visualProviders[typeUid]

      let params = {getVisual,types$,entities$}
      //TODO: some providers need the "types$" , others need entities$, needs to be specifiable
      if(visualProvider){
        visualProvider(entity, subJ, params)
      }
      //obsByTypes(entities,["A0"]).map()
      /*if(entity.typeUid === "A0") remoteMeshVisualProvider(entity, subJ, getVisual, types$)
      if(entity.typeUid === "A1") noteVisualProvider(entity, subJ, getVisual, entities$) 
      if(entity.typeUid === "A2") thicknessVisualProvider(entity, subJ, getVisual, entities$) 
      if(entity.typeUid === "A3") diameterVisualProvider(entity, subJ, getVisual, entities$) 
      if(entity.typeUid === "A4") distanceVisualProvider(entity, subJ, getVisual, entities$) */

    }else{
      console.log("reusing mesh from cache by iuid",iuid)
      let mesh = iuidToMesh[iuid]
      mesh = applyEntityPropsToMesh({entity,mesh})
      subJ.onNext(mesh)
    }

    return subJ.do(cache)//.map(mod)
  }


  function addVisualProvider(type,provider,extraParam){
    visualProviders[type]=provider
  }

  return {getVisual,addVisualProvider}
}


//annotations require 1...n preloaded meshes

  let annotStyle = {
    crossColor:"#000",
    textColor:"#000",
    lineColor:"#000",
    arrowColor:"#000",
    lineWidth:2.2,
    highlightColor: "#60C4F8",//"#00F",
    fontFace:"Open Sans"
  }

function noteVisualProvider(entity, subJ, params){
  console.log("note annot",entity)
  let {getVisual,entities$} = params
  let point = entity.target.point
  let deps = [entity.target.iuid]

  function visual(mesh){
    //mesh.updateMatrix()
    //mesh.updateMatrixWorld()
    let pt = new THREE.Vector3().fromArray(point)//.add(mesh.position)
    pt = mesh.localToWorld(pt)

    let params = {
      point:pt,
      object:mesh}
    params = Object.assign(params,annotStyle)

    return new annotations.NoteVisual(params)
  }

  meshesFromDeps(deps, getVisual, entities$)
    .subscribe(function(data){
      subJ.onNext(visual(data[0]))
    })
}

function thicknessVisualProvider(entity, subJ, params){
  let {getVisual,entities$} = params
  let deps = [entity.target.iuid]
  let entryPoint = entity.target.entryPoint
  let exitPoint  = entity.target.exitPoint
                    
  function visual(mesh){

    entryPoint= new THREE.Vector3().fromArray(entryPoint)
    exitPoint = new THREE.Vector3().fromArray(exitPoint)
    entryPoint = mesh.localToWorld(entryPoint)
    exitPoint = mesh.localToWorld(exitPoint)

    let params = {
      entryPoint,
      exitPoint,
      object:mesh
    }
    params = Object.assign(params,annotStyle)
    return new annotations.ThicknessVisual(params)
  }

  meshesFromDeps(deps, getVisual, entities$)
    .subscribe(function(data){
      subJ.onNext(visual(data[0]))
    })
}

function distanceVisualProvider(entity, subJ, params){
  let {getVisual,entities$} = params
  let start = entity.target.start
  let end = entity.target.end

  let deps = [start.iuid, end.iuid]

  function visual(startMesh, endMesh){
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

    return new annotations.DistanceVisual(params)
  }
        
  meshesFromDeps(deps, getVisual, entities$)
    .subscribe(function(data){
      subJ.onNext(visual(data[0],data[1]))
    })
}

function diameterVisualProvider(entity, subJ, params){
  let {getVisual,entities$} = params
  let point = entity.target.point
  let normal = entity.target.normal
  let diameter = entity.value
  let deps = [entity.target.iuid]
  
  function visual(mesh){
    point    = new THREE.Vector3().fromArray(point)
    normal   = new THREE.Vector3().fromArray(normal)
    //mesh.updateMatrix()
    //mesh.updateMatrixWorld()
    point = mesh.localToWorld(point)

    let params = {
         center:point,
         diameter,
         orientation:normal
      }
    params = Object.assign(params,annotStyle)

    return new annotations.DiameterVisual(params)
  }
     
  meshesFromDeps(deps, getVisual, entities$)
    .subscribe(function(data){
      subJ.onNext(visual(data[0]))
    })
}

/*for testing
let fakeEntities$= Rx.Observable.just({
    byId:{
        5:{typeUid:"A0",iuid:5,name:"PART1",pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]},
        2: {typeUid:"A0",iuid:2,name:"PART2",pos:[0,0,40],rot:[0,45,0],sca:[1,1,1]},
        7: {typeUid:"A0",iuid:7,name:"PART3",pos:[10,-20,0],rot:[0,0,0],sca:[1,1,1]},


        10:{typeUid:"A1",iuid:10,name:"ANNOT3",deps:[5,2,7],                     pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]},
        11:{typeUid:"A2",iuid:11,name:"Note ANNOT",value:"some text", deps:[2],  pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
          target:{point:[10,5,0],iuid:2}
        },
      }
    })
    .shareReplay(1)
  
  let {getVisual,addVisualProvider } = createVisualMapper(partTypes$, fakeEntities$)

  Rx.Observable.from([
    {typeUid:"A0",iuid:5,name:"PART1",pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]},
    {typeUid:"A0",iuid:2,name:"PART2",pos:[0,0,40],rot:[0,45,0],sca:[1,1,1]},
    {typeUid:"A0",iuid:7,name:"PART3",pos:[10,-20,0],rot:[0,0,0],sca:[1,1,1]},
    //{typeUid:"A1",iuid:10,name:"ANNOT3",deps:[5,2,7],pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]},
    {typeUid:"A1",iuid:11,name:"Note ANNOT",value:"some text",
      pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
      target:{point:[10,5,0],iuid:2}
    },
    {typeUid:"A2",iuid:12,name:"thickness ANNOT",value:150.45,
      pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
      target:{entryPoint:[10,5,0], exitPoint:[0,-7.2,19],iuid:5}
    },
    {typeUid:"A3",iuid:13,name:"Diameter ANNOT",value:34.09,
      pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
      target:{point:[10,5,0],normal:[1,0,0],iuid:7}
    },
    {typeUid:"A4",iuid:14,name:"distance ANNOT",value:56.22,
      pos:[0,0,0],rot:[0,0,0],sca:[1,1,1],
      target:{
        start:{point:[10,5,0],iuid:2}, 
        end:{point:[0,-7.2,19],iuid:5}
      }
    }
  ])
    .map(getVisual)
    .subscribe(function(vO){
      vO.subscribe(v2=>console.log("visuals",v2),e=>e,v3=>console.log("visuals done",v3))
    })
 */