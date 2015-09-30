export function commentsIntents(DOM, settings$){
  //interactions.get(".commentDetails","addComment$").subscribe(e=>console.log("gna",e))
  //.subscribe(e=>console.log("gna",e))

  return {
    addComments$ : DOM.select(".entityInfos").events("addComment$").pluck("detail")
    ,settings$
  }
}
