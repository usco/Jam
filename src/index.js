let Cycle = require('cycle-react')
import App from './App2'

Cycle.applyToDOM('#root', App)



/*let Cycle = require('cycle-react')
let React = require('react')
let Rx = Cycle.Rx

let App = Cycle.component('App', function(interactions,props, self){

  console.log("refs",self)

  let iSub = interactions.subject

  interactions.getEventSubject('onWrapperClick')
    .subscribe(event=>console.log("clicks in wrapper"))

  interactions.getEventSubject('onSubWrapDivClick')
    .subscribe(event=>console.log("clicks in subWrapDiv"))


  interactions.get(".subWrapDiv","click") //this does not work
    .subscribe(event=>console.log("clicks in subWrapDiv"))

  interactions.get(".subInnerDiv","click") //this one does : deepest level of nesting
    .subscribe(event=>console.log("clicks in subInnerDiv"))

  interactions.get(".wrapper","click") //this one, not 
    .subscribe(event=>console.log("clicks in wrapper"))


  return Rx.Observable.just("foo")
    .map(function(){

      return ()=> (
        <div className="wrapper" onClick={iSub('onWrapperClick').onEvent} ref="wrapper">
          <div className="subWrapDiv" onClick={interactions.subject('onSubWrapDivClick').onEvent}>
            <span> Hi there sub !</span>
            <div className="subInnerDiv">
              some sub div
            </div>
          </div>
        </div>
      )

    }) 
    
},{bindThis:true})*/

Cycle.applyToDOM('#root', App)