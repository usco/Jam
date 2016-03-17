export default function intent(DOM, params){
  const clearDesign$  = DOM.select('.reset').events("click")

  return {
    clearDesign$
  }
}
