export function commentsIntents(interactions, settings$){
  //interactions.get(".commentDetails","addComment$").subscribe(e=>console.log("gna",e))
  //.subscribe(e=>console.log("gna",e))

  return {
    addComments$ : interactions.get(".entityInfos","addComment$").pluck("detail")
    ,settings$
  }
}
