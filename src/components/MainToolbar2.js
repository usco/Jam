import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from 'classnames'

import {trim} from '../utils/utils'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import EditableItem from './EditableItem2'


function MainToolbar(props,interactions){

  function view(model$){
    let designCardWrapper = <div className="designCardWrapper fadesIn" />
    let designCardVisible = false
    let mode = "editor"
    let design = {name:"foo"}

    let annotationTypes = [
      "note",
      "thickness",
      "distance",
      "angle"
    ]

    if(designCardVisible){
      designCardWrapper = (
      <div className="designCardWrapper fadesOut">
        <DesignCard design={this.props.design}/> 
      </div>)
    }

    let editorElements = null
    let annotations = null
    if(mode !== "viewer"){
      annotations =  annotationTypes
        .map(type=>{
          return <button className={`add-${type}`} disabled={false}> {type} </button>
        })

      annotations = (
        <span className="annotations">
         {annotations}
        </span>
      )

      editorElements = <span>
        <h1>
          <EditableItem 
            data={design.name} 
            placeholder="untitled design" 
            className="designName"/> 
        </h1>
      </span>
    }

    return (
      <div className="titleBar">
        {editorElements}
        {annotations}
      </div>
    )
  }

  return Rx.Observable.just("").map(view)
}



let MainToolbar = Cycle.component('MainToolbar',MainToolbar)
export default MainToolbar