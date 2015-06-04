import React from 'react'

import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent

import logger from '../utils/log'
let log = logger("Jam-ToolBar")
log.setLevel("info")

import EditableItem from './EditableItem'
import DesignCard   from './DesignCard'

import {newDesign$, setDesignData$} from '../actions/designActions'
import {undo$,redo$,setDesignAsPersistent$,setSetting$} from '../actions/appActions'
import {toggleNote$,toggleThicknessAnnot$,toggleDistanceAnnot$, toggleDiameterAnnot$, toggleAngleAnnot$} from '../actions/annotActions'


class MainToolBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      appInfos:{
        name:"bla",
        version:"0.0.0"
      },
      designCardVisible:false,
    }
  }

  getStateStream() {
    return Observable.empty()
  }

  handleClick(event){
    console.log("state & props", this.state, this.props)
  }

  setDesignName(value){    
    setDesignData$({name:value})
  }

  toggleDesignCard(){
    this.setState({
      designCardVisible: !this.state.designCardVisible
    })
  }
  
  render() {
    let fullTitle = `(${this.props.appInfos.name} v  ${this.props.appInfos.version})`
    let history   = this.props.history
    //disabled={!disabled}


    let titleStyle = {}
    /*  width:"100%",
      padding: "5 0 0 10"
    }*/
    let fooStyle  = {
      display: "inline-block"
    }

    let designCardWrapper = <div className="designCardWrapper fadesIn" />
    if(this.state.designCardVisible){
      designCardWrapper = (
      <div className="designCardWrapper fadesOut">
        <DesignCard design={this.props.design}/> 
      </div>)
    }

    //console.log("this.props.undos.length===0",this.props.undos.length===0, this.props.undos.length, this.props.undos)

    let undosDisabled = this.props.undos.length<=1
    let redosDisabled = this.props.redos.length===0

    let persistent    = this.props.persistent || false


    let social = (
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
    )
    tools = null


     /*var cx = React.addons.classSet
        var classes = cx({
          'message-important': this.props.isImportant,
          'message-read': this.props.isRead
        })*/
        /*let noteClasses = cx({
          'note':true
          'active':true
        })*/

    console.log("props",this.props)
    function transform(e){
      setSetting$({path:"annotations.show",value:e.target.checked})
    }
    let annotations = (
      <span className="annotations">
        <button onClick={toggleNote$} className="note" disabled={false}> Note </button>
        <button onClick={toggleThicknessAnnot$} className="thickness" disabled={false}> thickness </button>
        <button onClick={toggleDistanceAnnot$} className="distance" disabled={false}> Distance </button>
        <button onClick={toggleDiameterAnnot$} className="diameter" disabled={false}> Diameter </button>
        <button onClick={toggleAngleAnnot$} className="angle" disabled={true}> Angle </button>

        <span>Show annotations</span>
        <input type="checkbox" defaultChecked ={false} 
          checked={this.props.settings.annotations.show} 
          onChange={ transform }/>
      </span>
    )

    
    return (
      <div className="titleBar" style={titleStyle}>
        <h1>
          <EditableItem 
            data={this.props.design.name} 
            changeCallback={ this.setDesignName } 
            placeholder="untitled design"
            ref="title" className="designName"/> 
        </h1>
        <span ref="title" className="appInfos"> {fullTitle} </span>
        <span>
          Active Tool : {this.props.activeTool}
        </span>
        <span>
          <button onClick={this.toggleDesignCard.bind(this)} className="details"> Details </button>
          <button onClick={newDesign$} className="new"> New design</button>
        </span>

        <span>
          <span>AutoSave online(temp btn?)</span>
          <input type="checkbox" checked={persistent} onChange={setDesignAsPersistent$}> </input>
        </span>

        <span className="history">
          <button disabled={undosDisabled} onClick={undo$} className="undo"> Undo </button> 
          <button disabled={redosDisabled} onClick={redo$} className="redo"> Redo </button> 
        </span>

        {social}

        <span className="otherStuff">
          <button onClick={this.handleClick.bind(this)} className="options" disabled={true}> options </button>
        </span>

        {designCardWrapper}
        
        {tools}

        {annotations}
      </div>
    )
  }
}

export default MainToolBar