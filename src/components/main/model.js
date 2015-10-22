import {combineLatestObj,replicateStream} from '../../utils/obsUtils'
import {generateUUID} from '../../utils/utils'

import {makeCoreSystem} from '../../core/entities/components/core' 
import {makeTransformsSystem} from '../../core/entities/components/transforms' 
import {makeMeshSystem} from '../../core/entities/components/mesh' 

import {entityTypeIntents, entityInstanceIntents} from '../../core/entities/intentHelpers'

import {selectionsIntents} from './intents/selections'

import settings from    '../../core/settings'
import comments from    '../../core/comments'
import selections from  '../../core/selections'
import entityTypes from '../../core/entities/entityTypes'
import bom         from '../../core/bom'

/*
  let intents = entityIntents(interactions)  

  //register meshes <=> types
  let registry = require('./core/entities/registry')
  let partTypes$ = registry({
    combos$:meshResources$
    ,reset$: intents.deleteAllInstances$
  })

  //get new instances from "types"
 
  //annotations
  let aIntents = annotationIntents(interactions)
  let aIntent = {
    creationStep$:aIntents.creationStep$,
    settings$:settings$
  }
  let addAnnotation$ = addAnnotationMod(aIntent)

  addAnnotation$
    .withLatestFrom(settings$,function(annotation,settings){
      if(!settings.repeatTool){
        clearActiveTool$()
      }
      //console.log("ok I am done with annotation",annotation,settings)
    })
    .subscribe(e=>e)

  let addInstance$ = newInstFromTypes$.merge(addAnnotation$)
  
  function remapEntityIntents(intent, addInstance$, settings$){
    return  {
      createInstance$:new Rx.Subject(),//createInstance$,
      addInstances$: addInstance$,

      updateInstance$: intent.selectionTransforms$,//
      deleteInstances$: intent.deleteInstances$,
      duplicateInstances$: intent.duplicateInstances$,  
      deleteAllInstances$: intent.deleteAllInstances$, 

      replaceAll$:intent.replaceAll$,
      settings$:settings$
    }
  }
  //entities
  let entities$ = entities(remapEntityIntents(intents,addInstance$,settings$))

  //bom
  let bomIntent = entriesFromEntities( bomIntents(interactions), entities$ )
  bomIntent.partTypes$ = partTypes$
  bomIntent.combos$    = meshResources$
 
  let bom$ = Bom(bomIntent)

  let {getVisual,addVisualProvider } = createVisualMapper(partTypes$, entities$)

  //selections 
  let selections$ = selections( reverseSelections(selectionsIntents(interactions),entities$) )

 
  //TODO:remove
  let contextTaps$ = intents.contextTaps$*/


function makeRegistry(instances$,types$){
  //register type=> instance & vice versa
  let base = {typeUidFromInstUid:{},instUidFromTypeUid:{}}

  instances$ = instances$.map(function(instances){
    let res = []
    Object.keys(instances).map(function(key){
      res.push( instances[key] )
    })
    return res
  })

  return combineLatestObj({instances$,types$})
    .map(function({instances, types}){

      let instUidFromTypeUid = instances
        .reduce(function(prev,instance){
          if(!prev[instance.typeUid]){
            prev[instance.typeUid] = []//instance.id
          }

          prev[instance.typeUid].push( instance.id )
          return prev
        },{})

      let typeUidFromInstUid = instances
        .reduce(function(prev,instance){
          prev[instance.id] = instance.typeUid
          return prev
        },{})

      return {instUidFromTypeUid,typeUidFromInstUid}
    })
}


export default function model(props$, actions, drivers){
  const DOM      = drivers.DOM
  const events   = drivers.events

  const entityActions = actions.entityActions

  const settings$      = settings( actions.settingActions, actions.settingsSources$ ) 
  const entityTypes$   = entityTypes( actions.entityTypeActions)
  const comments$      = comments( actions.commentActions)

  //hack
  const addBomEntries$ = new Rx.ReplaySubject()

  const entityInstancesBase$  =  entityInstanceIntents(entityTypes$)
    .addInstances$
    .map(function(newTypes){
      return newTypes.map(function(typeData){
        let instUid = generateUUID()//Math.round( Math.random()*100 )
        let typeUid = typeData.id
        let instName = typeData.name+"_"+instUid

        let instanceData = {
          id:instUid
          ,typeUid
          ,name:instName
        }

        addBomEntries$.onNext({id:typeUid,name:typeData.name,qty:1,version:"0.0.1",unit:"QA"})

        return instanceData
      })
    })
    .shareReplay(1)


  /*let foo$ = Rx.Observable.just(42)
    let fooS1$ = foo$.map(e=>({value:e,from:"fooS1"}))
    let fooS2$ = foo$.map(e=>({value:e,from:"fooS2"}))
    fooS1$.subscribe(e=>console.log("first",e))
    fooS2$.subscribe(e=>console.log("second",e))*/

  //entityTypes$.subscribe(e=>console.log("entityTypes",e))
  //entityInstancesBase$.subscribe(e=>console.log("entityInstancesBase",e))

  //create various components
  let componentBase$ = entityInstancesBase$
    .withLatestFrom(entityTypes$,function(instances,types){
      //console.log("instances",instances, "types",types)

      let data =  instances.map(function(instance){

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

        return {
          instUid
          ,typeUid
          ,instance
          ,mesh
          ,zOffset
        }
      })

      return data
    })
    .shareReplay(1)

  function remapCoreActions(entityActions, componentBase$, currentSelections$){
    const createComponents$ = componentBase$
      .filter(c=>c.length>0)
      .map(function(datas){
        return datas.map(function({instUid, typeUid, instance}){
          return { id:instUid,  value:{ id:instUid, typeUid, name:instance.name } }
        })
      })

    const removeComponents$ = entityActions.deleteEntityInstance$
      .withLatestFrom(currentSelections$,function(_,selections){
        console.log("selections core to remove",selections)
        return selections
      })
    
    const reset$           = entityActions.reset$
    const setAttribs$      = Rx.Observable.never()

    return {
      createComponents$
      ,removeComponents$
      ,clear:reset$
      ,setAttribs$
    }
  }

  function remapMeshActions(entityActions, componentBase$, currentSelections$){
    const createComponents$ = componentBase$
      .filter(c=>c.length>0)
      .map(function(datas){
        return datas.map(function({instUid, mesh}){
          return { id:instUid,  value:{ mesh } }
        })
      })

    const removeComponents$ = entityActions.deleteEntityInstance$
      .withLatestFrom(currentSelections$,function(_,selections){
        console.log("selections mesh to remove",selections)
        return selections
      })
    
    const reset$           = entityActions.reset$
    const setAttribs$      = Rx.Observable.never()

    return {
      createComponents$
      ,removeComponents$
      ,clear:reset$
    }
  }

  function remapTransformActions(entityActions, componentBase$, currentSelections$){
    const createComponents$ = componentBase$
      .filter(c=>c.length>0)
      .map(function(datas){
        return datas.map(function({instUid, zOffset}){
          return { id:instUid, value:{pos:[0,0,zOffset]} }
        })
      })

    const removeComponents$ = entityActions.deleteEntityInstance$
      .withLatestFrom(currentSelections$,function(_,selections){
        return selections
      })
    
    const reset$           = entityActions.reset$

    return {
      createComponents$
      ,removeComponents$
      ,clear:reset$
    }
  }

  const proxySelections$ = new Rx.ReplaySubject(1)

  let coreActions      = remapCoreActions(entityActions,componentBase$,proxySelections$)
  let meshActions      = remapMeshActions(entityActions,componentBase$,proxySelections$)
  let transformActions = remapTransformActions(entityActions,componentBase$,proxySelections$)

  let {core$}          = makeCoreSystem(coreActions)
  let {meshes$}        = makeMeshSystem(meshActions)
  let {transforms$}    = makeTransformsSystem(transformActions)
  //let {bounds$ ,boundActions}        = makeBoundingSystem()


  const typesInstancesRegistry$ =  makeRegistry(core$,entityTypes$)
  const selections$  = selections( selectionsIntents({DOM,events}, typesInstancesRegistry$) )

  selections$.subscribe(e=>console.log("selections",e))

  //TODO: all of these need to be refactored
  const currentSelections$ = selections$.pluck("instIds")
    .distinctUntilChanged()
    .shareReplay(1)

  //close some cycles
  replicateStream(currentSelections$,proxySelections$)

  //hack ??
  events
    .select("entityInfos")
    .flatMap(e=>e.changeCore$)
    .withLatestFrom(currentSelections$,function(coreChanges, instIds){
      console.log("setting core changes", coreChanges, instIds)
      instIds.map(function(instId){
        coreActions.setAttribs$.onNext({id:instId, value:coreChanges})
      })
    })
    .subscribe(e=>e)

  events
    .select("entityInfos")
    .flatMap(e=>e.changeTransforms$)
    .merge(
      events
        .select("gl")
        .flatMap(e=>e.selectionsTransforms$)
        .debounce(20)
    )
    .withLatestFrom(currentSelections$,function(transforms, instIds){
      instIds.map(function(instId){
        transformActions.updateTransforms$.onNext({id:instId, value:transforms})
      })
    })
    .subscribe(e=>e) 

  //clears out everything 
  /*entityActions
    .reset$
    .withLatestFrom(core$,function(e,instances){
      return{e,instances}
    })
    .subscribe(function({e,instances}){
      let instIds = Object.keys(instances)
      instIds.map(function(id){
        coreActions.removeComponents$.onNext({id})
        meshActions.removeComponents$.onNext({id})
        transformActions.removeComponents$.onNext({id})
      })
    })*/

  //duplicate
  entityActions
    .duplicateEntityInstance$
    .take(1)
    .withLatestFrom(currentSelections$,function(e, instIds){
      console.log("duplicateEntityInstance")


      instIds.map(function(id){
        let newId = generateUUID()

        let selected$ = core$.map(c=>c[id])
        
        selected$
          .do(e=>console.log("duplicate core",e))
          .map(function(c){
            let clone = Object.assign({},c)
            clone.id  = newId

            coreActions.clone$.onNext({id:c.id,value:newId}) 
            //return clone 
          })
          .subscribe(e=>console.log("duplicate core",e))
        //meshes$.map(c=>c[id])
        //transforms$.map(c=>c[id])
      })

    })
    .subscribe(e=>e) 

  
  //BOM
  function bomActionsFromOtherStuff(){
    const addBomEntries$ = null
    return {
      addBomEntries$
    }
  }

  let bomActions = Object.assign( {addBomEntries$},actions.bomActions )
  const bom$ = bom(bomActions)

  //loading flag , mostly for viewer mode
  /*const loading$ = Rx.Observable.merge(
      meshSources$
        .map(true)
      ,addInstance$
        .map(false)
    ).startWith(false)*/

  //combine all the above 
  const state$ = combineLatestObj({
    settings$ 
    ,selections$
    ,bom$
    ,comments$

    ,core$
    ,transforms$
    ,meshes$
  })


  return state$
}