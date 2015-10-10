import {Rx} from '@cycle/core'
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest

export function intent({DOM}){
  const addComment$          = DOM.select(".comments").events("addComment$").pluck("detail")

  const changeName$  = merge(
    DOM.select(".nameInput").events('change').map(e=>e.target.value)
    ,DOM.select(".nameInput").events('input').map(e=>e.target.value)
  )
  const changeColor$ = DOM.select(".colorInput").events('change').map(e=>e.target.value)

  /*const changeTransforms$ = combineLatestObj({
    pos:DOM.select(".transformsInput .pos_0").events('change').map(e=>e.target.value)
  })*/
  function fromTransformInputs(){
    let trans = ['pos','rot','sca']
    let defaults = {pos:[0,0,0],rot:[0,0,0],sca:[1,1,1]}
    let attrs = ['x','y','z']

    return trans.map(function(t){

      let subs= attrs.map(function(name,index){
        let className = `.transformsInput.${t}_${index}`
        return merge(
          DOM.select(className).events('change').map(e=>e.target.value)
          ,DOM.select(className).events('input').map(e=>e.target.value)
        )
        .map(function(value){
          let res = {}
          res[t] = {idx:index,value}
          return res
        })
        .distinctUntilChanged()
      })

      //subs[0].subscribe(e=>console.log("posX",e))

      return merge(subs)
    })
  }



  //change = {rot:{idx:0,val:2}}
  /*const posX$ = merge(
    DOM.select(".transformsInput.pos_0").events('change').map(e=>e.target.value)
    DOM.select(".transformsInput.pos_0").events('input').map(e=>e.target.value)
  ).map(function(value){
    return {pos:{idx:0,value}}
  })
  .distinctUntilChanged()*/
  /*const posY$ = merge(
    DOM.select(".transformsInput.pos_1").events('change').map(e=>e.target.value)
    ,DOM.select(".transformsInput.pos_1").events('input').map(e=>e.target.value)
  )
  const posZ$ = merge(
    DOM.select(".transformsInput.pos_2").events('change').map(e=>e.target.value)
    ,DOM.select(".transformsInput.pos_2").events('input').map(e=>e.target.value)
  )*/
  
  merge( fromTransformInputs()).subscribe(e=>console.log("transforms change",e))
  
  return {
    changeName$
    ,changeColor$
  }
}