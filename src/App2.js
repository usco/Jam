/*let Cycle = require('cycle-react')
let React = require('react')
let Rx = Cycle.Rx

// "component" returns a native React component which can be used normally
// by "React.createElement" and "Cycle.applyToDOM".
let Counter = Cycle.component('Counter', function (interactions, props) {
  return props.get('counter')
    .map(counter => <h3>Seconds Elapsed: {counter}</h3>)
})

let Timer = Cycle.component('Timer', function () {
  return Rx.Observable.interval(100).map(i =>
    <Counter counter={i} />
  )
})


export default Timer*/
require("./app.css")

let Cycle = require('cycle-react')
let React = require('react')
let Rx = Cycle.Rx

import GlView from './components/webgl/GlView'


function _App(interactions, props) {
  let activeTool = "rotate"
  return Rx.Observable.just("")
    .map(
      <div> Heyya ! 
        <GlView activeTool={activeTool}/> 
      </div>
    )
}


let App = Cycle.component('App', _App)

export default App