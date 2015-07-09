import Rx from 'rx'

//every time a part changes => rerender
//every time the visual "mapping" of a part changes => re-render
//visual = entity.map(fn)

/*

bom changes => remoteMeshVisualProvider  
ie: the user can change the visuals given by the remoteMeshVisualProvider via the bom


*/

//lazy load visual representation for each instance, based on type
//also each "part" instance needs a different mesh instance (because of diffences in color etc)
//most visuals return meshes loaded on the fly via xhr (need to account for lazy loading)
//finally some parts can have hard-coded  visuals

//perhaps we need "visualProviders" that register to streams of required visuals, and who only "care"
//for certain "types" (think, filter)


/*

  items$
    .flatMap(function(items){
      console.log("items",items)
      return Rx.Observable.from(items)
    })
    .filter(x=> [0,2].indexOf(x.type) > -1 )

  items$
    .flatMap(function(items){
      console.log("items",items)
      return Rx.Observable.from(items)

    })
    .filter(x=> [4,7].indexOf(x.type) > -1 )


  items$
    .flatMap(function(items){
      console.log("items",items)
      return Rx.Observable.from(items)

    })
    .filter(x=> [3,5].indexOf(x.type) > -1 )
*/

//helper for mockup, from mdn
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

//method to filter the source data by types : types are arrays of typeUids
export function obsByTypes(srcData, types){
  return srcData
    .flatMap(function(items){
      console.log("items",items)
      return Rx.Observable.from(items)
    })
    .filter(x=> types.indexOf(x.type) > -1 )
}

/*this function would take raw input data and 
  - first return a "raw" blockout of a mesh (bounding box, a spiner etc)
  - emulated the random amount of time it would take to return the actual mesh from
  a remote location (via xhr or anything etc)
*/
function returnBlockOutAndThenMesh(entry){
  let subJ = new Rx.ReplaySubject()
  let blockout = {output:"triangle_blockout",entry:JSON.stringify(entry)}

  //send the blockout
  subJ.onNext(blockout)

  Rx.Observable
    .timer(getRandomInt(150, 4000), 100)//simulate a response taking a random amount of time
    .map({output:"triangle",entry:JSON.stringify(entry)})
    .take(1)
    .subscribe( data => subJ.onNext(data) )

  return subJ
}

export function entityToVisuals(){
  console.log("experimental entities to visuals")

  let exampleData = [
      {type:0,iuid:0},
      {type:0,iuid:1},
      {type:2,iuid:7},
      {type:4,iuid:4},
      {type:5,iuid:6},
      {type:7,iuid:13}
    ]

  let items$ = Rx.Observable.just(exampleData)


  //------------------------------//
  //remote visual mesh provider
  let remoteMeshVisualProvider$ = obsByTypes(items$, [2])
    .flatMap(returnBlockOutAndThenMesh)
    /*.flatMap(function(entry){
      //here we would resolve data
      return Rx.Observable.timer(getRandomInt(50, 4000), 100).map({output:"triangle",entry:JSON.stringify(entry)}).take(2)
    })*/

  //remoteMeshVisualProvider$.subscribe(data => console.log("remoteMeshVisualProvider will deal with ",data))
  remoteMeshVisualProvider$.subscribe(data => console.log("remoteMeshVisualProvider will output ",data))


  //------------------------------//
  //static visual provider
  let staticVisualProvider$ = obsByTypes(items$, [4,7])
    .map(function(entry){
      switch(entry.type){
        case 4:
          return {output:"circle",entry:JSON.stringify(entry)}
        break
        case 7:
          return {output:"square",entry:JSON.stringify(entry)}
        break
      }
    })

  //staticVisualProvider$.subscribe(data => console.log("staticVisualProvider will deal with ",data))
  staticVisualProvider$.subscribe(data => console.log("staticVisualProvider will output ",data))

  //------------------------------//
  //other visual provider
  let otherVisualProvider$ = obsByTypes(items$, [3,5])

  otherVisualProvider$.subscribe(data => console.log("otherVisualProvider will deal with ",data))



  let visualProviders$ = Rx.Observable.merge(
    remoteMeshVisualProvider$,
    staticVisualProvider$,
    otherVisualProvider$
  )
  return visualProviders$
}



///////////////
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