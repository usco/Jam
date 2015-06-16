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

