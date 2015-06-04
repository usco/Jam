    //-------COMMANDS OR SOMETHING LIKE THEM -----
  //FIXME this should be a command or something
  /*set currently selected entities*/
  /*
  selectEntities(selectedEntities){
    let selectedEntities = selectedEntities || []
    if(selectedEntities.constructor !== Array) selectedEntities = [selectedEntities]
    this.setState({
      selectedEntities:selectedEntities
    })
    log.info("selectedEntities",selectedEntities)
  }*/

  //FIXME this should be a command or something
  /*set transforms of given entity
  setEntityTransforms(entity, transforms){
    log.info("setting transforms of",entity, "to", transforms)

    let _entitiesById = this.state._entitiesById

    for(key in transforms){
      _entitiesById[entity.iuid][key] = transforms[key]
    }

    // _entitiesById[entity.iuid].rot = transforms.rot
    //  _entitiesById[entity.iuid].sca = transforms.sca
    

    this.setState({_entitiesById:_entitiesById})
  }*/

  //FIXME this should be a command or something
  /*register a new entity type
  addEntityType( type ){
    log.info("adding entity type", type)
    let nKlasses  = this.state._entityKlasses
    nKlasses.push( type )
    //this.setState({_entityKlasses:this.state._entityKlasses.push(type)})
    this.setState({_entityKlasses:nKlasses})
  }*/

  //FIXME this should be a command or something

import Rx from 'rx'
let Observable= Rx.Observable
let Subject   = Rx.Subject
import {createAction} from '../utils/obsUtils'

/*set bounding box of given entity
in the form : {entity:entity,bbox:bbox}
*/
export let setEntityBBox = createAction()

/*set entities as selectedd*/
export let selectEntities$ = createAction()

/*add new entities to active assembly*/
export let addEntityInstances$ = createAction()

/*add new entity type*/
export let addEntityType$ = createAction()

/*delete given entities*/
export let deleteEntities$ = createAction()

/*delete all entities in assembly*/
export let deleteAllEntities$ = createAction()

/*duplicate given entitites*/
export let duplicateEntities$ = createAction()

/*set entity data : FIXME : merge all the above ?*/
export let setEntityData$ = createAction()

