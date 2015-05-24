import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import {setEntityTransforms, deleteEntities, duplicateEntities} from '../actions/entityActions'

//this would be a stand in for example for a "sink" in 
//charge of saving data, or a central state manager etc

/*Observable.merge(setEntityTransforms, deleteEntities, duplicateEntities).subscribe(
  function(val){console.log("next",val)},
  function(error){console.log("error",error)}
)*/

/*
testAction
  .map(function(val){
    console.log("val",val);
    return val;
  })
  .subscribe(
    function(value){console.log("next for testAction",value)},
  function(error){console.log("error",error)},
  function(end){console.log("DONE",end)}
  )

testAction({foo:24});*/
  
/*export function setEntityTransforms(entity, transforms){
  log.info("setting transforms of",entity, "to", transforms)

  let _entitiesById = this.state._entitiesById;

  for(key in transforms){
    _entitiesById[entity.iuid][key] = transforms[key];
  }

  // _entitiesById[entity.iuid].rot = transforms.rot;
  //  _entitiesById[entity.iuid].sca = transforms.sca;
  

  this.setState({_entitiesById:_entitiesById})
}*/