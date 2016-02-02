export function makeEntityActionsFromDom(DOM){
  const reset$                    = DOM.select('.reset').events("click")
  const removeEntityType$         = undefined //same as delete type/ remove bom entry
  const deleteInstances$          = DOM.select('.delete').events("click")
  const duplicateInstances$       = DOM.select('.duplicate').events("click")
  
  return {
    reset$
    , removeEntityType$
    , deleteInstances$
    , duplicateInstances$
  } 
}