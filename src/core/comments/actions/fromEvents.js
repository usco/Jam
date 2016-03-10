export default function intent(events, params){
  const addComments$ = events.select("comments")
    .events("addComment$")

  return {
    addComments$
  }
}
