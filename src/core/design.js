import logger from 'log-minim'
let log = logger("design")
log.setLevel("error")

import Rx from 'rx'
let fromEvent = Rx.Observable.fromEvent
let Observable = Rx.Observable
let merge = Rx.Observable.merge

const defaults = {
  name:        undefined,
  description: undefined,
  version:     undefined,//"0.0.0",
  authors:     [],
  tags:        [],
  licenses:    [],
  meta:        undefined,

  uri:undefined,

  _persistent:false,
  _doSave:true
}


function makeModification$(intent){

  /**/
  let newDesign$ = intent.newDesign$ 
    .map((data) => (designData) => {

      let design = Object.assign({}, designData, data, defaults)
      return design
    })


  let updateDesign$ = intent.updateDesign$ 
    .map((data) => (designData) => {
      log.info("setting design data", data)

      let design = Object.assign({}, designData, data)

      return design
    })


  let setAsPersistent$ = intent.setAsPersistent$
    .map((flag) => (designData) => {
      log.info("setting design as persistent", flag)
      let output = designData._persistent
      if(flag === undefined || flag === null){
        output = !output
      }else{
        output = flag
      }

      let design = Object.assign({}, designData)
      design._persistent = output

      return design
    })

    return merge(
      newDesign$,
      updateDesign$,
      setAsPersistent$

    )
}



function model(intent, source) {
  let source$ = source || Observable.just(defaults)

  let modification$ = makeModification$(intent)

  return modification$
    .merge(source$)
    .scan((designData, modFn) => modFn(designData))//combine existing data with new one
    //.distinctUntilChanged()
    .shareReplay(1)
}

export default model