export function commentsIntents(drivers){
  const addComments$ = drivers.events.select("comments")
    .flatMap(e=>e.addComment$)

  return {
    addComments$ 
  }
}
