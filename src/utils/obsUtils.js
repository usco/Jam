import Rx from 'rx'
let Observable= Rx.Observable;
let Subject   = Rx.Subject;

/* create an action that is both an observable AND
a function/callable*/
export function createAction(paramsMap){

  function action(params){
    //use rest parameters or not ? ...params
    if(paramsMap && typeof paramsMap === 'function')
    {
      params = paramsMap(params);
    }
    action.onNext(params);
  }
  //assign prototype stuff from Subject
  for (let key in Rx.Subject.prototype) {
    action[key] = Rx.Subject.prototype[key];
  }

  Rx.Subject.call( action )

  return action;
}


export function logNext( next ){
  log.info( next )
}
export function logError( err){
  log.error(err)
}
