/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
import screenfull from 'screenfull'


function FullScreenToggler({DOM, props}) {

  let toggle$ =  DOM.select(".fullScreenToggler").events("click")
    .map(true)
    .startWith(false)
    .scan((acc,val)=>!acc)

  let vtree$ = toggle$
    .map(function(toggle){

      if (screenfull.enabled) {
        screenfull.toggle()
      } 

      let fullScreenTogglerImg = null

      if(!screenfull.isFullscreen)
      {
        fullScreenTogglerImg = `
          <svg version="1.1" id="Resize_full_screen"
             x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
            <path d="M6.987,10.987l-2.931,3.031L2,11.589V18h6.387l-2.43-2.081l3.03-2.932L6.987,10.987z M11.613,2l2.43,2.081l-3.03,2.932l2,2
            l2.931-3.031L18,8.411V2H11.613z"/>
          </svg>`
      }else{
        fullScreenTogglerImg = `
          <svg version="1.1" id="Resize_100_x25_" xmlns="http://www.w3.org/2000/svg" 
            x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
            <path fill="#FFFFFF" d="M4.1,14.1L1,17l2,2l2.9-3.1L8,18v-6H2L4.1,14.1z M19,3l-2-2l-2.9,3.1L12,2v6h6l-2.1-2.1L19,3z"/>
          </svg>`
      }

      return(
        <button className="fullScreenToggler" innerHTML={fullScreenTogglerImg}>
        </button>
      )
    })
  return {
    DOM:vtree$
  }
}

export default FullScreenToggler