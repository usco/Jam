import {getEntryExitThickness,
  getObjectPointNormal,
  computeCenterDiaNormalFromThreePoints,
  getDistanceFromStartEnd
} from '../components/webgl/utils'

import {addNote$, addThicknessAnnot$, addDistanceAnnot$, addDiameterAnnot$,
toggleNote$,toggleThicknessAnnot$,toggleDistanceAnnot$, toggleDiameterAnnot$, toggleAngleAnnot$} from '../actions/annotActions'
import {setActiveTool$,clearActiveTool$} from '../actions/appActions'

import {first,toggleCursor} from '../utils/otherUtils'
import {generateUUID} from 'usco-kernel2/src/utils'

import logger from '../utils/log'
let log = logger("annotations")
log.setLevel("error")

import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge


//utilities
/*generate note annotation data from input*/
function generateNoteData(data){
  
  console.log("hey yo, add a note",data)
  let {object, point, normal} = data
  
  let annotation = {
    typeUid:"0",
    iuid:generateUUID(),
    value:undefined,
    name:"notexx", 
    target:{
      point:point.toArray(), 
      normal:normal.toArray(),
      typeUid:undefined,
      iuid:object.userData.entity.iuid//here we could toggle, instance vs type
    }
  }

  return annotation
}

/*generate thickness annotation data from input*/
function generateThicknessData(data){
  
  console.log("hey yo, add a thickness",data)

  let {object, entryPoint, exitPoint, thickness} = data

  let iuid   = object.userData.entity.iuid
  entryPoint = entryPoint.toArray()
  exitPoint  = exitPoint.toArray()

  let annotation = {
    typeUid:"1",
    iuid:generateUUID(),
    name:"thicknessxx", 
    value:thickness,
    target:{
      entryPoint:entryPoint, 
      exitPoint: exitPoint,
      normal:undefined,
      typeUid:undefined,
      iuid:object.userData.entity.iuid//here we could toggle, instance vs type
    }
  }

  return annotation
}

/*generate distance annotation data from input*/
function generateDistanceData(data){
  
  console.log("hey yo, add a distance",data)
  let [start,end] = data

  let distance = getDistanceFromStartEnd(start.point,end.point)

  let annotation = {
    typeUid:"2",
    iuid:generateUUID(),
    name:"distance", 
    value:distance,
    target:{
      start:{
        point  : start.point.toArray(), 
        typeUid:undefined,
        iuid:start.object.userData.entity.iuid
      }, 
      end: {
        point  : end.point.toArray(), 
        typeUid:undefined,
        iuid:end.object.userData.entity.iuid
      }
    }
  }
  return annotation
}

/*generate diameter annotation data from input*/
function generateDiameterData(data){
  
  console.log("hey yo, add a diameter",data)
  let [start,mid,end] = data
  let {center,diameter,normal} = computeCenterDiaNormalFromThreePoints(start.point,mid.point,end.point)

  let annotation = {
    typeUid:"3",
    iuid:generateUUID(),
    name:"diameter", 
    value:diameter,
    target:{
      normal:normal.toArray(),
      point:center.toArray(),
      typeUid:undefined,
      iuid:start.object.userData.entity.iuid
    }
  }

  return annotation
}

/*generate angle annotation data from input*/
function generateAngleData(data){
  
  console.log("hey yo, add an angle",data)
  let [start,mid,end] = data

  let annotation = {
    typeUid:"4",
    iuid:generateUUID(),
    name:"angle", 
    value:0,
    target:{
      start:{
        point  : start.point.toArray(), 
        typeUid:undefined,
        iuid:start.object.userData.entity.iuid
      }, 
      mid:{
        point  : mid.point.toArray(), 
        typeUid:undefined,
        iuid:mid.object.userData.entity.iuid
      },
      end: {
        point  : end.point.toArray(), 
        typeUid:undefined,
        iuid:end.object.userData.entity.iuid
      }
    }
  }

  return annotation
}

///////////////
//FIXME: where do these belong ? they are not really model side, so intent ?
//also, they are indepdendant from other aspects, but they are "sinks"
//also, perhaps each tool type shouls specify what cursor it wants ?
/*toggleNote$
  .map(function(val){
    console.log("cursor",val)
    return val
  })
  .subscribe((toggled)=>toggleCursor(toggled,"crosshair"))

toggleThicknessAnnot$
  .subscribe((toggled)=>toggleCursor(toggled,"crosshair"))

toggleDistanceAnnot$
  .subscribe((toggled)=>toggleCursor(toggled,"crosshair"))

toggleDiameterAnnot$
  .subscribe((toggled)=>toggleCursor(toggled,"crosshair"))

toggleAngleAnnot$
  .subscribe((toggled)=>toggleCursor(toggled,"crosshair"))*/
//temporary hack for cursor 
function handleCursor(input){
  input
    .pluck("activeTool")
    .subscribe(function (activeTool) {
      /*switch(activeTool){
        case :
      }*/
      if(activeTool !== undefined){
        toggleCursor(true,"crosshair")
      }
    })
}

///////////////
//FIXME: is this more of an intent ??
function addAnnotationMod$(intent){

  let activeTool$ = intent.activeTool$
  let baseStream$ = intent.singleTaps$
      .map( (event)=>event.detail.pickingInfos)
      .filter( (pickingInfos)=>pickingInfos.length>0)
      .map(first)
      .share()

  baseStream$ = baseStream$.withLatestFrom(
    activeTool$,
    (s1, s2)=> { return {data:s1, activeTool:s2} }
  )

  function dataOnly(entry){ return entry.data }

  let noteAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "addNote" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .map(generateNoteData)

  let thickessAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "addThickess" )
    .map(dataOnly)
    .map(getEntryExitThickness)
    .map(generateThicknessData)

  let distanceAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "addDistance" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .bufferWithCount(2)//we need 2 data points to generate a distance
    .map(generateDistanceData)

  let diameterAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "addDiameter" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .bufferWithCount(3)//we need 3 data points to generate a diameter
    .map(generateDiameterData)

  let angleAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "addAngle" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .bufferWithCount(3)//we need 3 data points to generate an angle
    .map(generateAngleData)

  let additions$ = merge(
    noteAnnot$,
    thickessAnnot$,
    distanceAnnot$,
    diameterAnnot$,
    angleAnnot$
    ).share()

  //clear currently active tool : is this a hack?
  additions$.subscribe(clearActiveTool$)

  return additions$
}


function makeModification$(intent){

  let addAnnot$ = intent.addAnnotations$
    .map((nData) => (annotList) => {
      log.info("adding annotation(s)",nData)
      //FIXME , immutable
      let newData = nData || []
      if(newData.constructor !== Array) newData = [newData]

      annotList = annotList.concat( newData )
      return annotList
    })

  let deleteAnnots$ = intent.deleteAnnots$
    .map((annotData) => (annotList) => {
      //let annotIndex = searchTodoIndex(todosData.list, todoid);
      //annotList.splice(todoIndex, 1);
      let nAnnots  = annotList
      let _tmp2 = annotData.map(entity=>entity.iuid)
      let outAnnotations = nAnnots.filter(function(entity){ return _tmp2.indexOf(entity.iuid)===-1})

      return outAnnotations
    })

  return merge(
    addAnnot$,
    deleteAnnots$
  )
}


function model(intent, source) {
  let source$ = source.annotData$ || Observable.just([])
  //hack
  intent.addAnnotations$ = intent.addAnnotations$
    .merge( addAnnotationMod$(intent) )

  let modification$ = makeModification$(intent)

  return modification$
    .merge(source$)
    .scan((annotData, modFn) => modFn(annotData))//combine existing data with new one
    .shareReplay(1)
}

export default model