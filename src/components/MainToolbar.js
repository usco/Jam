import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from 'classnames'

import {trim} from '../utils/utils'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import EditableItem from './EditableItem'

import logger from '../utils/log'
let log = logger("ToolBar")
log.setLevel("info")

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


/* let social = (
      <span className="social"> 
        <span>
          <button onClick={this.handleClick.bind(this)} className="fork" disabled={true}> Fork </button>
        </span>
        <span>
          <button onClick={this.handleClick.bind(this)} className="download" disabled={true}> Download </button>
        </span>
        <div style={fooStyle}>
          <button onClick={this.handleClick.bind(this)} className="viewOnYm" disabled={true}> View on YM </button>
        </div>
        <span>
          <button onClick={this.handleClick.bind(this)} className="share" disabled={true}> Share </button>
        </span>
        <span>
          <button onClick={this.handleClick.bind(this)} className="like" disabled={true}> Like </button>
        </span>
      </span>
    )
    social = null

    let tools = (
      <span className="tools">
        <button onClick={this.handleClick.bind(this)} className="bom" disabled={true}> Bom </button>
        <button onClick={this.handleClick.bind(this)} className="networkGraph" disabled={true}> NetworkGraph </button>
        <button onClick={this.handleClick.bind(this)} className="commit" disabled={true}> Commit (named save) </button>
      </span>
    )*/