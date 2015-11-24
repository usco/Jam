import Rx from 'rx'

//test hack/helper driver
export default function eventDriver(outgoing$){
  outgoing$ = outgoing$ || Rx.Observable.just({})

  function deep_value(path, obj){
    try{
      for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
        obj = obj[path[i]]
      }
      return obj
    }
    catch(error){}
  }

  function makeEventsSelector(source$){
    return function events(eventName){

      return source$.flatMapLatest(source => {
        if (!source) {
          return Rx.Observable.empty()
        }
        return source[eventName]
      }).share()
    }
  }


  function makeSourceSelector(path){
    const source$ = outgoing$
      .map( deep_value.bind(null,path) )
      .filter(e=>e!==undefined)
      //.shareReplay(1)
    const events = makeEventsSelector(source$)
    return {
      events 
    }
  }

  return {
    select: makeSourceSelector
  }
}