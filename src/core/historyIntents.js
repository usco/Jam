import Rx from 'rx'


export function historyIntents(interactions){

  let undo$ = interactions.get("#undo","click")
  let redo$ = interactions.get("#redo","click")

  return {
    undo$
    ,redo$
  }
}