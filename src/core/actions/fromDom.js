export function makeEntityActionsFromDom(DOM){
  const reset$                    = DOM.select('.reset').events("click")
  const removeTypes$         = undefined //same as delete type/ remove bom entry
  const deleteInstances$          = DOM.select('.delete').events("click")
  const duplicateInstances$       = DOM.select('.duplicate').events("click")
  
  return {
    reset$
    , removeTypes$
    , deleteInstances$
    , duplicateInstances$
  } 
}