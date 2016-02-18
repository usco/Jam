export function mergeActionsByName(actionSources, validActions=[]){

  return actionSources.reduce(function(result, actions){
    //console.log("acions",Object.keys(actions),validActions)
    Object.keys(actions)
      .filter(key=> validActions.length === 0 || validActions.indexOf(key.replace('$',''))>-1)
      .map(function(key){
        const action = actions[key]
        if(key in result){
          result[key] = merge(result[key], action)
        }else{
          result[key] = action
        }       
      })

    return result
  },{}) 
}


/*utility function to dynamically load and use the "data extractors" (ie functions that
 extract useful data from raw data)
*/
export function actionsFromSources(validActions=[], sources, basePath){

  const data = Object.keys(sources).map(function(sourceName){
    try{
      const modulePath     = basePath+sourceName
      const actionsImport  = require(modulePath)

      return actionsImport.intent(sources)
    }catch(error){}
  })
  .filter(data=>data!==undefined)

  return mergeActionsByName( data, validActions )
}