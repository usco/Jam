
/*
let partInstance = {
    name: data.name,
    iuid: generateUUID(),
    typeUid: data.typeUid,
    color: "#07a9ff",
    pos: [ 0, 0, h/2 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ],
    bbox:data.bbox
}*/

//just experimenting with thoughts about component based system
let partComponents = []
function makeCoreComponent(typeUid){
  return  Rx.Observable.just({
    name: data.name,
    iuid: generateUUID(),
    typeUid: typeUid,
    color: "#07a9ff"
  })
}

function makeTransformComponent(){
  return  Rx.Observable.just({
    pos: [ 0, 0, 0 ],
    rot: [ 0, 0, 0 ],
    sca: [ 1, 1, 1 ]
  })
}

function makeBoundingComponent(){
  return Rx.Observable.just({
    min:[0,0,0],
    max:[0,0,0]
  })
}

let bounds$ = makeBoundingComponent()
let transforms$ = makeTransformComponent()
let components = [bounds$, transforms$]
let combo = combineLatestObj
  transforms$
  