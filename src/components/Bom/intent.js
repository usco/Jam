

export default function intent(DOM){
  let entryTapped$  = DOM.select(".bomEntry").events('click')
  let headerTapped$ = DOM.select(".headerCell").events('click')

  let removeEntry$ = DOM.select('DOM', '.remove-btn').events('click')

  return {
    entryTapped$
    ,headerTapped$
    ,removeEntry$
  }
}