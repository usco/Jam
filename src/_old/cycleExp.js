  let testCompoData$ = intent(interactions)

<TestCompo data={testCompoData}/>

/*let obsTest$ = Rx.Observable.timer(200, 100)
    .do((data) => console.log("data",data)) //SIDE EFFECT !!
    .map((data)=>`data${data})
    .subscribe((data)=>console.log("subscribed data",data)) */

function TestCompo(interactions,props){
  let vtree$= props.get("data")
    .map(function(data){
      //console.log("data",data)
      return <div className="foo">
        <span> Testing </span>
        <button className="innerButton">clicky </button>
        <input type="checkbox" id="fooSetting" checked={data.valid}/> 
      </div>
      } 
    )
  return {
    view:vtree$,
    events:{
      mambo:Rx.Observable.timer(200, 100),
    }

  }
}

TestCompo = Cycle.component('TestCompo',TestCompo)


function intent(interactions){
  let clicky$ = interactions.get(".foo .innerButton","click").map(true).startWith(true)
  let checky$ = interactions.get(".foo #fooSetting","change").map(event => event.target.checked).startWith(false)
    /*interactions.get(".foo","mambo")
    .subscribe(settings => console.log("inner mambo"))*/

  let bla$ = Rx.Observable.combineLatest(
    clicky$,
    checky$,
    function(clicky,checky){
      return {
        valid:checky,
        stuff:"42"
      }

    }
  )
  return bla$
}