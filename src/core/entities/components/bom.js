function makeBomSystem(){
  const defaults = []


  function addBomEntry(state,input){

    state = mergeData(state,input)
    return state
  }

  function removeBomEntry(state,input){

    return state
  }

  let actions = {removeComponents$: new Rx.Subject()
    , addBomEntry$:new Rx.Subject()
    , removeBomEntry$: new Rx.Subject()}

  let updateFns = {removeComponents, addBomEntry, removeBomEntry}
  let meta$ = makeModel(defaults, updateFns, actions)

  return {bom$,bomActions:actions}
}