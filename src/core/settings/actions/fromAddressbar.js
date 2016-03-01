import {toArray} from '../../../utils/utils'

export default function intent(addressbar, params){

  const setAppMode$       = addressbar.get("appMode")
    .map(d=>d.pop())//what mode is the app in ? ("editor" or "viewer" only for now)
    
  const setToolsets$      = addressbar.get("tools")
    .map(d=>d.pop())
    .filter(data=>data.length >0)
    .map(function(data){
      if(data.indexOf(',')>-1){
        return data.split(',').filter(d=>d.length>0)
      }else {
        return data
      }
    })
    .map(toArray)


  return {
    setAppMode$
    ,setToolsets$
  }
}
