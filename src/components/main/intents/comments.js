export function commentsIntents(drivers){
  const addComments$ = drivers.events.select("comments").events("addComment$")
    //.flatMap(e=>e.addComment$)

  return {
    addComments$ 
  }
}
