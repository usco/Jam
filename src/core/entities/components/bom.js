function makeBomSystem(){
  const defaults = []


  function addBomEntry(state,input){

    state = mergeData(state,input)
    return state
  }

  function removeBomEntry(state,input){

    return state
  }

  let actions = {removeComponent$: new Rx.Subject()
    , addBomEntry$:new Rx.Subject()
    , removeBomEntry$: new Rx.Subject()}

  let updateFns = {removeComponent, addBomEntry, removeBomEntry}
  let meta$ = makeModelNoHistory(defaults, updateFns, actions)

  return {bom$,bomActions:actions}
}