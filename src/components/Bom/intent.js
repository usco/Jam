

export default function intent(DOM){
  const entryTapped$  = DOM.select(".bomEntry").events('click',true)//capture == true
    .do(e=>e.stopPropagation())
    .map(e => e.currentTarget.dataset.id)
    //e.target.attributes["data-transform"].value    
  const headerTapped$ = DOM.select(".headerCell").events('click',true)
    .do(e=>e.stopPropagation())
  const removeEntry$ = DOM.select('DOM', '.remove-btn').events('click',true)
    .do(e=>e.stopPropagation())

  return {
    entryTapped$
    ,headerTapped$
    ,removeEntry$
  }
}