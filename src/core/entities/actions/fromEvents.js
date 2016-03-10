export default function intent(events, params){
  //entities/components
  const updateMetaComponent$ = events
    .select("entityInfos")
    .events("changeMeta$")
    .map(c=>( {target:"meta",data:c}))

  const updateTransformComponent$ = events
    .select("entityInfos")
    .events("changeTransforms$")
    .merge(
      events
        .select("gl")
        .events("selectionsTransforms$")
        .debounce(20)
    )
    .map(c=>( {target:"transforms",data:c}))

  const updateComponent$ = merge(
    updateMetaComponent$
    ,updateTransformComponent$
  )

  return {
    updateComponent$
  }
}
