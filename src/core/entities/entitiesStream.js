var Rx = require( 'rx' )
//var combineTemplate = require('rx.observable.combinetemplate')
var merge = Rx.Observable.merge

var mesh$ = Rx.Observable
  .interval(10 /* ms */)
  .timeInterval()
  .map(function(e){return {name:"bla"+e.value+".stl"}})
  .take(1)

var src$ = Rx.Observable
  .interval(100 /* ms */)
  .timeInterval()
  .map(function(e){return {name:"bla"+e.value+".scad"}})
  .take(1)

var meta$ = Rx.Observable
  .interval(150 /* ms */)
  .timeInterval()
  .map(function(e){return {name:"foo"+e.value,params:["width:"+e.interval]}})
  .take(1)

//how do we guarantee that the items at the same "index" in the source streams are for the same part/entity ?  
//the user can actually supply all those items one by one, or all at once

//actually useable stream ?
//from meshes 

var fromMesh$ = fillInBlanks("mesh",mesh$) 
//from sources
var fromSource$ = fillInBlanks("source",src$)
//from metadata
var fromMeta$ = fillInBlanks("meta",meta$)


var splitSource$ = merge(
 fromMeta$
 ,fromMesh$
 ,fromSource$
)


var savedDataSource$ = Rx.Observable.just(
  {
    meta: {name:"foo",params:["width:45"]}
    ,mesh:{name:"bla.stl"}
    ,source:{name:"bla.scad"}
  }
)


//need to make sure source data structure is right 
function applyDefaults(defaults, data$){
  return data$.map(function(data){
    return Object.assign(defaults,data)
  })
}

function fillInBlanks(inputFieldName, data$){
  const defaults = {meta:undefined, mesh:undefined, source:undefined}
  
  return data$.map(function(data){
    let _input = {}
    _input[inputFieldName] = data
    return Object.assign(defaults, _input)
  })
}

/*
  meshData =>
  srcData  =>
  metaData =>
  xxx      =>
  foo      =>
  bar      =>
*/

/*
  also need to handle all cases with multiple inputs ??
  or is that a false use case ? ie what are the cases where we get more than one entry at a time ?

  duh'!
  reloading from storage is one such case
*/

/*var entitySource$ = Rx.Observable.combineLatest(
  mesh$
  ,src$
  ,meta$
  ,function(mesh,src,meta){
    
    return {mesh:mesh,src:src,meta:meta}
  })
*/

var dataSource$ = merge(
  splitSource$
  ,savedDataSource$
  )

function onNext(e){
  console.log("Fully populated entity",e)
}


dataSource$.subscribe( onNext )

export default "foo"