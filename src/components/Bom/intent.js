

export default function intent(DOM){
  const entryTapped$  = DOM.select(".bomEntry").events('click')
    .map(e => e.currentTarget.dataset.id)
    //e.target.attributes["data-transform"].value    
  const headerTapped$ = DOM.select(".headerCell").events('click')
  const removeEntry$ = DOM.select('DOM', '.remove-btn').events('click')

  return {
    entryTapped$
    ,headerTapped$
    ,removeEntry$
  }
}