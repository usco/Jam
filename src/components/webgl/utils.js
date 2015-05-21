import THREE from 'three'

export function getEntryExitThickness(entryInteresect, normalType){
  let normal  = entryInteresect.face.normal.clone()
  switch(normalType)
  {
    case "face":
    break
    case "x":
      normal = new THREE.Vector3(1,0,0)
    break
    case "y":
      normal = new THREE.Vector3(0,1,0)
    break
    case "z":
      normal = new THREE.Vector3(0,0,1)
    break
  }
    
  let object = entryInteresect.object
  if( !object ) return undefined
    
  let entryPoint = entryInteresect.point.clone()
  let flippedNormal = normal.clone().negate()
  let offsetPoint = entryPoint.clone().add( flippedNormal.clone().multiplyScalar(10000))
    
  //get escape entryPoint
  let raycaster  = new THREE.Raycaster(offsetPoint, normal.clone().normalize())
  let intersects = raycaster.intersectObjects([object], true)
    
  let exitPoint = null
  let minDist   = Infinity
  
  intersects.map(function(entry){
      let curPt = entry.point
      let curLn = curPt.clone().sub( entryPoint ).length()
      
      if( curLn < minDist )
      {
        exitPoint = curPt
        minDist = curLn
      }
    })
   
  //FIXME: todo or not ??
  object.worldToLocal( entryPoint )
  object.worldToLocal( exitPoint )
  
  //compute actual thickness
  let endToStart = exitPoint.clone().sub( entryPoint )
  let thickness = endToStart.length()
  
  return {object, entryPoint, exitPoint, thickness}
}


export function getObjectPointNormal(pickingInfos){
  let point = pickingInfos.point//closest point
  let object= pickingInfos.object//closest point
  let face  = pickingInfos.face//closes face
  let normal= face.normal

  //set point coordinates to be local , not global
  //FIXME: are we sure about this?
  object.worldToLocal( point )

  return {object, point, normal}
}

