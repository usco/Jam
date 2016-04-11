export default function intent (DOM, params) {
  // const clearDesign$= DOM.select('.reset').events("click")
  const deleteInstances$ = DOM.select('.delete').events('click').map(undefined)
  const duplicateInstances$ = DOM.select('.duplicate').events('click')

  return {
    deleteInstances$,
    duplicateInstances$
  }
}
