import {combineLatestObj} from '../../utils/obsUtils'

import {makeCoreSystem,makeTransformsSystem,makeMeshSystem, makeBoundingSystem} from '../../core/entities/entities2'
import {entityTypeIntents, entityInstanceIntents} from '../../core/entities/intents2'

import {selectionsIntents} from '../../core/selections/intents'



import entityTypes from '../../core/entities/entityTypes'
import settings from '../../core/settings/settings'
import comments from '../../core/comments/comments'
import selections from '../../core/selections/selections'


function makeRegistry(){
  //register type=> instance & vice versa
  let base = {typeUidFromInstUid:{},instUidFromTypeUid:{}}
  let typesInstancesRegistry$ = combineLatestObj({instances:entityInstancesBase$,types:entityTypes$})
    .scan(base,function(acc,n){

      let {instances,types} = n

      acc.instUidFromTypeUid = instances
        .reduce(function(prev,instance){
          prev[instance.typeUid] = instance.id
          return prev
        },{})

      acc.typeUidFromInstUid = instances
        .reduce(function(prev,instance){
          prev[instance.id] = instance.typeUid
          return prev
        },{})

      //console.log("registry stuff",acc,n)
      return acc
    })

  return typesInstancesRegistry$
}


export default function model(props$, actions, drivers){
  const DOM      = drivers.DOM
  const events   = drivers.events

  const settings$      = settings( actions.settingActions, actions.settingsSources$ ) 
  const entityTypes$   = entityTypes( actions.entityTypeActions)
  //const comments$      = comments(commentsIntents(DOM,settings$))

  let {core$,coreActions}            = makeCoreSystem()
  let {meshes$,meshActions}          = makeMeshSystem()
  let {transforms$,transformActions} = makeTransformsSystem()
  let {bounds$ ,boundActions}        = makeBoundingSystem()

  const entityInstancesBase$  =  entityInstanceIntents(entityTypes$)
    .addInstances$
    .map(function(newTypes){
      return newTypes.map(function(typeData){
        let instUid = Math.round( Math.random()*100 )
        let typeUid = typeData.id
        let instName = typeData.name+"_"+instUid

        let instanceData = {
          id:instUid
          ,typeUid
          ,name:instName
        }
        return instanceData
      })
      console.log("DONE with entityInstancesBase")
    })
    .shareReplay(1)

  //register type=> instance & vice versa
  let base = {typeUidFromInstUid:{},instUidFromTypeUid:{}}
  let typesInstancesRegistry$ = combineLatestObj({instances:entityInstancesBase$,types:entityTypes$})
    .scan(base,function(acc,n){

      let {instances,types} = n

      acc.instUidFromTypeUid = instances
        .reduce(function(prev,instance){
          prev[instance.typeUid] = instance.id
          return prev
        },{})

      acc.typeUidFromInstUid = instances
        .reduce(function(prev,instance){
          prev[instance.id] = instance.typeUid
          return prev
        },{})

      //console.log("registry stuff",acc,n)
      return acc
    })

  //create various components
  entityInstancesBase$
    .withLatestFrom(entityTypes$,function(instances,types){
      //console.log("instances",instances, "types",types)

      instances.map(function(instance){

        let instUid = instance.id
        let typeUid = instance.typeUid

        //is this a hack?
        let mesh = types.typeUidToTemplateMesh[typeUid]
        let bbox = mesh.boundingBox
        let zOffset = bbox.max.clone().sub(bbox.min)
        zOffset = zOffset.z/2
        bbox = { min:bbox.min.toArray(), max:bbox.max.toArray() }

        //injecting data like this is the right way ?
        mesh = mesh.clone()
        mesh.userData.entity = {
          iuid:instUid
        }

        coreActions.createComponent$.onNext({id:instUid,  value:{ typeUid, name:instance.name }})
        boundActions.createComponent$.onNext({id:instUid, value:{bbox} })
        meshActions.createComponent$.onNext({id:instUid,  value:{ mesh }})
        transformActions.createComponent$.onNext({id:instUid, value:{pos:[0,0,zOffset]} })

        console.log("DONE with creating various components")
      })
    })
    .subscribe(e=>e)

  const selections$  = selections( selectionsIntents({DOM,events}, typesInstancesRegistry$) )

  //hack
  events
    .select("entityInfos")
    .flatMap(e=>e.changeCore$)
    .withLatestFrom(selections$.pluck("instIds"),function(coreChanges, instIds){
      console.log("setting core changes", coreChanges, instIds)
      instIds.map(function(instId){
        coreActions.setAttribs$.onNext({id:instId, value:coreChanges})
      })
    })
    .subscribe(e=>e)

  events
    .select("entityInfos")
    .flatMap(e=>e.changeTransforms$)
    .withLatestFrom(selections$.pluck("instIds"),function(transforms, instIds){
      //console.log("setting transforms", transforms, instIds)
      instIds.map(function(instId){
        transformActions.updateTransforms$.onNext({id:instId, value:transforms})
      })
    })
    .subscribe(e=>e) 


  //combine all the above 
  const state$ = combineLatestObj({
    settings$ 
    ,selections$

    ,core$
    ,transforms$
    ,meshes$
  })


  return state$
}