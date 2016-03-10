export default function intent(DOM, params){
  //const clearDesign$                    = DOM.select('.reset').events("click")

  const removeTypes$         = undefined //same as delete type/ remove bom entry
  const deleteInstances$          = DOM.select('.delete').events("click")
  const duplicateInstances$       = DOM.select('.duplicate').events("click")

  return {
    removeTypes$
    , deleteInstances$
    , duplicateInstances$
  }
}
