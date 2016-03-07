export function intent(DOM, params){

  const removeTypes$         = undefined //same as delete type/ remove bom entry
  const deleteInstances$          = DOM.select('.delete').events("click")
  const duplicateInstances$       = DOM.select('.duplicate').events("click")

  return {
    , removeTypes$
    , deleteInstances$
    , duplicateInstances$
  }
}
