import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from "classnames"

import {setSetting$} from '../actions/appActions'


//fyi for now, we hardcode some of the ui 

function SettingsView(interactions, props) {

  let settings$ = props.get('settings').startWith({})

  let showGrid$ = interactions.get(".showGrid", "change")
    .map(e => e.target.checked)
    .filter( settings => settings !== undefined )
    .merge(settings$.map( 
      function(settings){
        if( settings.grid && settings.grid.show ) return settings.grid.show //FIXME: hack needed because of other issues
        return false
      }))
      //settings => settings.grid.show ) )
    
  let showAnnot$ = interactions.get(".showAnnot", "change")
    .map(e => e.target.checked)
    .filter( settings => settings !== undefined )
    .merge(settings$.map( 
      function(settings){
        if( settings.annotations && settings.annotations.show ) return settings.annotations.show //FIXME: hack needed because of other issues
        return false
      }))
      //settings => settings.annotations.show ) )

  let autoRotate$ = interactions.get(".autoRotate", "change")
    .map(e => e.target.checked)
    .filter( settings => settings !== undefined )
    //.map( settings => settings.camera.autoRotate )
    .merge(settings$.map( 
      function(settings){
        if( settings.camera && settings.camera.autoRotate ) return settings.annotations.autoRotate //FIXME: hack needed because of other issues
        return false
      }))

  //let autoRotate$ = Rx.Observable.just(true)
    
  //output
  interactions.get(".showGrid", "click")
    .map(e => e.target.checked)
    .subscribe(function(checked){
      setSetting$({path:"grid.show",value:checked})
    })

  interactions.get(".showAnnot", "click")
    .map(e => e.target.checked)
    .subscribe(function(checked){
      setSetting$({path:"annotations.show",value:checked})
    })

  interactions.get(".autoRotate", "click")
    .map(e => e.target.checked)
    .subscribe(function(checked){
      setSetting$({path:"camera.autoRotate",value:checked})
    })


  let toggled$ = interactions.get(".toggler", "click")
    .map(e => true)
    .scan(function(acc,n){
      return (!acc)
    })
    .startWith(false)


  /*interactions.get(".settings","click")
    //.do(e => e.preventDefault)
    .subscribe(function(){
      console.log("click inside settings")
  })

  Rx.Observable.fromEvent(document,'click')
    .subscribe(function(){
      console.log("clicked document")
    })*/
    
  let vtree$ = Rx.Observable
    .combineLatest(
      settings$,
      showGrid$,
      showAnnot$,
      autoRotate$,
      toggled$,
      function(settings ,showGrid, showAnnot, autoRotate, toggled){
        let fields = undefined
        //console.log("settings",settings)
        
        /*let fields = settings
          .map(function(){
            <input type="checkbox" >Foo </input> 
          })*/
        if(toggled)
        {
          fields = (
            <div>
              <section className="settingEntry">
                <input className="showGrid" type="checkbox" id="showGrid" checked={showGrid}> </input> 
                <label for="showGrid"> Show grid </label>
              </section>
              <section className="settingEntry">
                <input className="showAnnot" type="checkbox" id="showAnnot" checked={showAnnot}> </input> 
                <label for="showAnnot"> Show annotations </label>
              </section>
              <section className="settingEntry">
                <input className="autoRotate" type="checkbox" id="autoRotate" checked={autoRotate}> </input>
                <label for="autoRotate"> Auto rotate camera </label>
              </section>
            </div>
          )
        }

        return(
         <div className="settings">
          <button id="toggler" className={Class("toggler", {toggled: toggled})} >
            <svg version="1.1" id="Cog" xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px"
                 viewBox="0 0 20 20" enable-background="new 0 0 20 20" className="icon toggler">
              <path fill="#FFFFFF" d="M16.783,10c0-1.049,0.646-1.875,1.617-2.443c-0.176-0.584-0.407-1.145-0.692-1.672
                c-1.089,0.285-1.97-0.141-2.711-0.883c-0.741-0.74-0.968-1.621-0.683-2.711c-0.527-0.285-1.088-0.518-1.672-0.691
                C12.074,2.57,11.047,3.215,10,3.215c-1.048,0-2.074-0.645-2.643-1.615C6.772,1.773,6.213,2.006,5.686,2.291
                c0.285,1.09,0.059,1.971-0.684,2.711C4.262,5.744,3.381,6.17,2.291,5.885C2.006,6.412,1.774,6.973,1.6,7.557
                C2.57,8.125,3.215,8.951,3.215,10c0,1.047-0.645,2.074-1.615,2.643c0.175,0.584,0.406,1.144,0.691,1.672
                c1.09-0.285,1.971-0.059,2.711,0.682c0.741,0.742,0.969,1.623,0.684,2.711c0.527,0.285,1.087,0.518,1.672,0.693
                c0.568-0.973,1.595-1.617,2.643-1.617c1.047,0,2.074,0.645,2.643,1.617c0.584-0.176,1.144-0.408,1.672-0.693
                c-0.285-1.088-0.059-1.969,0.683-2.711c0.741-0.74,1.622-1.166,2.711-0.883c0.285-0.527,0.517-1.086,0.692-1.672
                C17.429,11.873,16.783,11.047,16.783,10z M10,13.652c-2.018,0-3.653-1.635-3.653-3.652c0-2.018,1.636-3.654,3.653-3.654
                c2.018,0,3.652,1.637,3.652,3.654C13.652,12.018,12.018,13.652,10,13.652z"/>
              </svg>
          </button>
          <section className={Class("content", {toggled: toggled})}>
          {fields}
          </section>
        </div>)
      } 
    )

  return {
    view: vtree$,
    events: {
    }
  }
}

let SettingsView = Cycle.component('SettingsView',SettingsView)
export default SettingsView