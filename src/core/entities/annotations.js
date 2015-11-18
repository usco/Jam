import {getEntryExitThickness,
  getObjectPointNormal,
  computeCenterDiaNormalFromThreePoints,
  getDistanceFromStartEnd,
  computeAngleFromThreePoints
} from '../../components/webgl/utils'

import {first,toggleCursor} from '../../utils/otherUtils'
import {generateUUID} from 'usco-kernel2/src/utils'
import {exists} from '../../utils/obsUtils'

//import {clearActiveTool$} from 

import logger from '../../utils/log'
let log = logger("annotations")
log.setLevel("info")

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
    typeUid:"A1",
    id:generateUUID(),
    cid:1,
    name:"note", 
    target:{
      point:point.toArray(), 
      normal:normal.toArray(),
      typeUid:undefined,
      id:object.userData.entity.id//here we could toggle, instance vs type
    }
  }

  return annotation
}

/*generate thickness annotation data from input*/
function generateThicknessData(data){
  
  console.log("hey yo, add a thickness",data)

  let {object, entryPoint, exitPoint, thickness} = data

  let id   = object.userData.entity.id
  entryPoint = entryPoint.toArray()
  exitPoint  = exitPoint.toArray()

  let annotation = {
    typeUid:"A2",
    id:generateUUID(),
    cid:2,
    name:"thickness", 
    value:thickness,
    target:{
      entryPoint:entryPoint, 
      exitPoint: exitPoint,
      normal:undefined,
      typeUid:undefined,
      id:object.userData.entity.id//here we could toggle, instance vs type
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
    typeUid:"A4",
    id:generateUUID(),
    cid:3,//categoryId
    name:"distance", 
    value:distance,
    target:{
      start:{
        point  : start.point.toArray(), 
        typeUid:undefined,
        id:start.object.userData.entity.id
      }, 
      end: {
        point  : end.point.toArray(), 
        typeUid:undefined,
        id:end.object.userData.entity.id
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
    typeUid:"A3",
    id:generateUUID(),
    cid:4,//categoryId
    name:"diameter", 
    value:diameter,
    target:{
      normal:normal.toArray(),
      point:center.toArray(),
      typeUid:undefined,
      id:start.object.userData.entity.id
    }
  }

  return annotation
}

/*generate angle annotation data from input*/
function generateAngleData(data){
  
  console.log("hey yo, add an angle",data)
  let [start,mid,end] = data
  let angle = computeAngleFromThreePoints(start.point,mid.point,end.point)
  angle = angle * 180/ Math.PI

  let annotation = {
    typeUid:"A5",
    id:generateUUID(),
    cid:5,//categoryId
    name:"angle", 
    value:angle,
    target:{
      start:{
        point  : start.point.toArray(), 
        typeUid:undefined,
        id:start.object.userData.entity.id
      }, 
      mid:{
        point  : mid.point.toArray(), 
        typeUid:undefined,
        id:mid.object.userData.entity.id
      },
      end: {
        point  : end.point.toArray(), 
        typeUid:undefined,
        id:end.object.userData.entity.id
      }
    }
  }

  return annotation
}

///////////////
//FIXME: where do these belong ? they are not really model side, so actions ?
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

  //document.getElementById("mydiv").style.cursor="move";
}


function hasEntity(data){
  return (data.object.userData.entity && data.object.userData.entity.id)
}

///////////////
//FIXME: is this more of an actions ??
export function addAnnotation(actions, settings$){
  function dataOnly(entry){ return entry.data }

  const activeTool$ = settings$.pluck("activeTool")
  const baseStream$ = actions.creationStep$
    .withLatestFrom(
      activeTool$,
      (data, activeTool)=> { return {data, activeTool} }
    )  


  const noteAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "addNote" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .filter(hasEntity)//we need data to have entity infos
    .map(generateNoteData)

  const thickessAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "measureThickness" )
    .map(dataOnly)
    .map(getEntryExitThickness)
    .filter(hasEntity)//we need data to have entity infos
    .map(generateThicknessData)

  const distanceAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "measureDistance" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .filter(hasEntity)//we need data to have entity infos
    .bufferWithCount(2)//we need 2 data points to generate a distance
    .do(e=>console.log("measuring  distance",e))

    .map(generateDistanceData)

  const diameterAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "measureDiameter" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .filter(hasEntity)//we need data to have entity infos
    .bufferWithCount(3)//we need 3 data points to generate a diameter
    .map(generateDiameterData)

  const angleAnnot$ = baseStream$
    .filter((data)=>data.activeTool === "measureAngle" )
    .map(dataOnly)
    .map(getObjectPointNormal)
    .filter(hasEntity)//we need data to have entity infos
    .bufferWithCount(3)//we need 3 data points to generate an angle
    .map(generateAngleData)

  const additions$ = merge(
      noteAnnot$,
      thickessAnnot$,
      distanceAnnot$,
      diameterAnnot$,
      angleAnnot$
    )
    .share()

  return additions$
}
