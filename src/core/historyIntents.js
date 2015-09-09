import Rx from 'rx'


export function historyIntents(interactions){

  let undo$ = interactions.get("#undo","click").map(true)
  let redo$ = interactions.get("#redo","click").map(false)

  return {
    undo$
    ,redo$
  }
}