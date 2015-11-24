import intent from './intent'
import model from './model'
import view from './view'

function addExtraData(actions,props$){
  const entity$     = props$.pluck('entity')

  //helper function, tor return uids (type/instance)
  function getIds(entity){
    console.log("getIds")
    if(entity){
      return {typeUid:entity.typeUid, id:entity.id}
    }
    return {typeUid:undefined, id:undefined}
  }

  const addComment$ = actions.addComment$
    .withLatestFrom(
      entity$.map(getIds)
      ,function(commentText,entityData){
        return { text:commentText, target:entityData}
      })
    .shareReplay(1)

  return {
    addComment$
  }
}

function Comments({DOM,props$}) {
  const actions = intent(DOM)
  const state$ = model(props$, actions)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    events:{
      addComment$: addExtraData(actions,state$).addComment$
    }
  }
}

export default Comments
