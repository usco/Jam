export function commentsIntents(drivers){
  const addComments$ = drivers.events.select("comments").events("addComment$")

  return {
    addComments$ 
  }
}
