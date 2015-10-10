require("./app.css")
/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {makeDOMDriver, hJSX} from '@cycle/dom'
import Class from "classnames"

import combineTemplate from 'rx.observable.combinetemplate'
let fromEvent = Rx.Observable.fromEvent
let just = Rx.Observable.just
let merge = Rx.Observable.merge
let fromArray = Rx.Observable.fromArray

import {observableDragAndDrop} from './interactions/dragAndDrop'

//views etc
import BomView from './components/Bom/BomView'
import GLView from './components/webgl/GlView3'
import SettingsView from './components/SettingsView'
import FullScreenToggler from './components/FullScreenToggler'
import EntityInfos       from './components/EntityInfos2'

//settings
import settings from './core/settings/settings'
import {settingsIntent} from './core/settings/settingsIntent'
//comments
import comments from './core/comments/comments'
import {commentsIntents} from './core/comments/intents'
//selections
import selections from './core/selections/selections'
import {selectionsIntents} from './core/selections/intents'
//entities
import {extractDesignSources,extractMeshSources,extractSourceSources} from './core/sources/dataSources'
import {makeCoreSystem,makeTransformsSystem,makeMeshSystem, makeBoundingSystem} from './core/entities/entities2'
import entityTypes from './core/entities/entityTypes'
import {entityTypeIntents, entityInstanceIntents} from './core/entities/intents2'


import {getExtension} from './utils/utils'
import {combineLatestObj} from './utils/obsUtils'
import {prepForRender} from './utils/uiUtils'


function view(state$, DOM, name){
  const settingProps$ = state$//.map(s=>s.settings)
  /*just({
    ,schema : {
      showGrid:{type:"checkbox",path:"grid.show"}
      ,autoRotate:{type:"checkbox",path:"camera.autoRotate"}
      //,annotations:{type:"checkbox",path:"grid.show"}
    }
  })*/
  function makeEntityInfosProps(state$){
    const selectedInstIds$ = state$.pluck("selections")
      .map(s=>s.instIds)

    return selectedInstIds$
      .combineLatest(state$,function(ids,state){
        
        let transforms = ids.map(function(id){
          return state.transforms[id]
        })
        
        let core = ids.map(function(id){
          return state.core[id]
        })
        return {transforms,core}
      })
  }
  //extractDataForEntityInfos(state$).subscribe(e=>console.log("state",e))

  //settings
  let settingsUi = SettingsView({DOM, props$:settingProps$})
  //fullscreen 
  let fsTogglerUi = FullScreenToggler({DOM})

  //entity infos
  let entityInfosProps$ = just(undefined)
  let entityInfosUi = EntityInfos({DOM,props$:makeEntityInfosProps(state$)})

  //for bom
  
  function makeBomProps(state$){
    let fieldNames = ["name","qty","unit","version"]
    let sortableFields = ["id","name","qty","unit"]
    let entries = [{id:0,name:"foo",qty:2,version:"0.0.1",unit:"QA"}
    ,{id:1,name:"bar",qty:1,version:"0.2.1",unit:"QA"}
    ]
    //let selectedEntries = selections.bomIds
    let fieldNames$ = just(fieldNames)
    let sortableFields$ = just(sortableFields)
    let entries$ = just(entries)
    let selectedEntries$ = state$.pluck("selections").pluck("bomIds")

    let bomProps$ = combineLatestObj( {fieldNames$,sortableFields$,entries$,selectedEntries$ })

    return bomProps$
  }

    //just({fieldNames,sortableFields,entries})
  let bomUi     = BomView({DOM,props$:makeBomProps(state$)})

  let glProps$  = combineLatestObj({settings:state$.pluck("settings")
    ,meshes:state$.pluck("meshes")
    ,transforms:state$.pluck("transforms")
  })
  let glUi      = GLView({DOM,props$:glProps$})
  const glEvents    = glUi.events

  ///////
  //final results
  const events = {gl:glEvents}

  DOM = prepForRender({fsTogglerUi,settingsUi,bomUi, glUi, entityInfosUi, meshes:state$.pluck("meshes")})
    .map(function({settings,fsToggler,bom,gl,entityInfos,meshes}){
      return <div>
        {settings}
        {fsToggler}
        {bom}
        {gl}

        {entityInfos}
      </div>
    })

  return {events,DOM}
}


export function main(drivers) {
  let DOM      = drivers.DOM
  const localStorage = drivers.localStorage
  const addressbar   = drivers.addressbar
  const postMessage  = drivers.postMessage
  const events       = drivers.events

  events
    .select("gl")
    .flatMap(e=>e.selectedMeshes$)
    .subscribe(e=>console.log("events",e))

  ///
  let dragOvers$  = DOM.select("#root").events("dragover")
  let drops$      = DOM.select("#root").events("drop")  
  let dnd$        = observableDragAndDrop(dragOvers$, drops$) 

  //Sources of settings
  const settingsSources$ = localStorage.get("jam!-settings")
  const settings$ = settings( settingsIntent(drivers), settingsSources$ ) 

  //data sources for our main model
  let postMessages$  = postMessage
  const meshSources$ = extractMeshSources({dnd$, postMessages$, addressbar})
  const srcSources$  = extractSourceSources({dnd$, postMessages$, addressbar})

  //Models etc 
  //entities$
  const entities$   = Rx.Observable.just(undefined)
  //comments
  const comments$   = comments(commentsIntents(DOM,settings$))
  const bom$        = undefined
  
  //
  let {core$,coreActions}            = makeCoreSystem()
  let {meshes$,meshActions}          = makeMeshSystem()
  let {transforms$,transformActions} = makeTransformsSystem()
  let {bounds$ ,boundActions}        = makeBoundingSystem()

  const entityTypes$ = entityTypes(entityTypeIntents({meshSources$,srcSources$}))

  let entityInstancesBase$  =  entityInstanceIntents(entityTypes$)
    .addInstances$
    .map(function(newTypes){
      console.log("data",newTypes)

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

      //types.typeData[]
      //console.log("registry stuff",acc,n)
      return acc
    })
    
  //.subscribe(e=>console.log("FOOOO",e))

  //experimental , not sure
  /*
  function instUidFromTypeUids(core$,types$, typeUids){
    return combineLatestObj({instances:core$,types$})
      .map(function({instances,types}){
        return typeUids.map(function(tuid){
           //FIXME: implement  
        })

      })
  }

  function typeUidFromInstUids(core$, types$, instUids){
    return combineLatestObj({instances:core$,types$})
      .map(function({instances,types}){

        return instUids.map(function(iuid){
          let inst = instances[iuid]
          if(inst) return inst.typeUid 
        })
      })
  }

  entityInstancesBase$
    .subscribe(function(){
        typeUidFromInstUids(core$, entityTypes$, [10]).subscribe(e=>console.log("e",e))
        instUidFromTypeUids(core$, entityTypes$, [10]).subscribe(e=>console.log("e",e))
    })*/

  //create various components
  entityInstancesBase$
    .withLatestFrom(entityTypes$,function(instances,types){
      console.log("instances",instances, "types",types)

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

        boundActions.createComponent$.onNext({id:instUid, value:{bbox} })
        meshActions.createComponent$.onNext({id:instUid,  value:{ mesh }})
        coreActions.createComponent$.onNext({id:instUid,  value:{ typeUid, name:instance.name }})
        transformActions.createComponent$.onNext({id:instUid, value:{pos:[0,0,zOffset]} })
      })
    })
    .subscribe(e=>e)


  //selections 
  const selections$ = selections( selectionsIntents({DOM,events}, typesInstancesRegistry$) )

  selections$.subscribe(e=>console.log("selections",e))

  //////////
  let state$ = combineLatestObj({settings$, selections$, core$,transforms$,meshes$})

  let _view = view(state$, DOM)

  //output to localStorage
  //in our case, settings
  const localStorage$ = settings$
    .map( s=>({"jam!-settings":JSON.stringify(s)}) )

  //return anything you want to output to drivers
  return {
      DOM: _view.DOM
      ,events: just(_view.events)
      ,localStorage:localStorage$

  }
}

