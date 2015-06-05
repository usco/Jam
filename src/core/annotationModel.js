import {getEntryExitThickness,
  getObjectPointNormal,
  computeCenterDiaNormalFromThreePoints,
  getDistanceFromStartEnd
} from '../components/webgl/utils'

import {addNote$, addThicknessAnnot$, addDistanceAnnot$, addDiameterAnnot$,
toggleNote$,toggleThicknessAnnot$,toggleDistanceAnnot$, toggleDiameterAnnot$, toggleAngleAnnot$} from '../actions/annotActions'

import {first,toggleCursor} from '../utils/otherUtils'
import {generateUUID} from 'usco-kernel2/src/utils'


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
let annotationsSource = []


function makeMods(intent){

console.log("makeMods")
  let activeTool = intent.activeTool
  let baseStream$ = intent.singleTaps$
      .map( (event)=>event.detail.pickingInfos)
      .filter( (pickingInfos)=>pickingInfos.length>0)
      .map(first)
      .share()

  baseStream$ = Observable.combineLatest(
        baseStream$,
        activeTool,
        function (s1, s2) { /*console.log("data",s1,s2);*/return {data:s1,activeTool:s2} }
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
    .bufferWithCount(2)
    .map(generateDistanceData)

  let diameterAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "addDiameter" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .bufferWithCount(3)
    .map(generateDiameterData)

  let angleAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "addAngle" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .bufferWithCount(3)
    .map(generateAngleData)

  return merge(
    noteAnnot$,
    thickessAnnot$,
    distanceAnnot$,
    diameterAnnot$,
    angleAnnot$
    )
}


function model(intent, source) {
  /*let modification$ = makeMods$(intent);
  return modification$
    .merge(source.todosData$)
    .scan((todosData, modFn) => modFn(todosData))
    .combineLatest(route$, determineFilter)
    .shareReplay(1);*/

  return makeMods(intent)
}

export default model