


export function designIntents(interactions){

  //get any "clear" message from post message
  let postMessages$ = require('../drivers/postMessageDriver')( )
  let newDesign$ = postMessages$
    .filter(hasClear).map(true)

  return {
    newDesign$
  }
}


