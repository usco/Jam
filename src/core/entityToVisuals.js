import Rx from 'rx'

//every time a part changes => rerender
//every time the visual "mapping" of a part changes => re-render

//lazy load visual representation for each instance, based on type
//also each "part" instance needs a different mesh instance (because of diffences in color etc)
//most visuals return meshes loaded on the fly via xhr (need to account for lazy loading)
//finally some parts can have hard-coded  visuals

//perhaps we need "visualProviders" that register to streams of required visuals, and who only "care"
//for certain "types" (think, filter)


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


  //remote visual mesh provider
  let remoteMeshVisualProvider$ = items$
    .flatMap(function(items){
      console.log("items",items)
      return Rx.Observable.from(items)
    })
    .filter(x=> [0,2].indexOf(x.type) > -1 )
  
  remoteMeshVisualProvider$.subscribe(data => console.log("remoteMeshVisualProvider will deal with ",data))

  //static visual provider
  let staticVisualProvider$ = items$
    .flatMap(function(items){
      console.log("items",items)
      return Rx.Observable.from(items)

    })
    .filter(x=> [4,7].indexOf(x.type) > -1 )

  staticVisualProvider$.subscribe(data => console.log("staticVisualProvider will deal with ",data))


    //static visual provider
  let otherVisualProvider$ = items$
    .flatMap(function(items){
      console.log("items",items)
      return Rx.Observable.from(items)

    })
    .filter(x=> [3,5].indexOf(x.type) > -1 )

  otherVisualProvider$.subscribe(data => console.log("otherVisualProvider will deal with ",data))

  let visualProviders$ = Rx.Observable.merge(
    remoteMeshVisualProvider$,
    staticVisualProvider$,
    otherVisualProvider$
  )
  return visualProviders$
}