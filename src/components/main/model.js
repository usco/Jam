//settings
import settings from './core/settings/settings'
import {settingsIntent} from './core/settings/settingsIntent'
//comments
import comments from './core/comments/comments'
import {commentsIntents} from './core/comments/intents'
//selections
import selections from './core/selections/selections'
import {selectionsIntents} from './core/selections/intents'


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


function model(props$, actions){
  //data sources for our main model
  let postMessages$  = postMessage
  const meshSources$ = extractMeshSources({dnd$, postMessages$, addressbar})
  const srcSources$  = extractSourceSources({dnd$, postMessages$, addressbar})

  //Sources of settings
  const settingsSources$ = localStorage.get("jam!-settings")
  

  ///different models
  const settings$    = settings( settingsIntent(drivers), settingsSources$ ) 
  const entityTypes$ = entityTypes( actions.createEntityType$)
  const selections$  = selections( selectionsIntents({DOM,events}, typesInstancesRegistry$) )


  //combine all the above 
  const state$ = combineLatestObj({settings$, selections$, core$, transforms$, meshes$})


  return state$
}