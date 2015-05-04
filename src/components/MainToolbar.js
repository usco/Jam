import RxReact from 'rx-react';
import React from 'react';
let StateStreamMixin = RxReact.StateStreamMixin;

import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import logger from '../utils/log'
let log = logger("Jam-ToolBar");
log.setLevel("info");

import EditableItem from './EditableItem'


class MainToolBar extends RxReact.Component {
  constructor(props) {
    super(props);
    this.state = {
      appInfos:{
        name:"bla",
        version:"0.0.0"
      }
    }
  }

  getStateStream() {
    return Observable.empty()
  }

  handleClick(event){
    console.log("state & props", this.state, this.props)
  }
  
  render() {
    //log.info("bla",this.props)
    let fullTitle = `(${this.props.appInfos.name} v  ${this.props.appInfos.version})`;
    let titleStyle = {};
    /*  width:"100%",
      padding: "5 0 0 10"
    };*/
    let fooStyle  = {
      display: "inline-block"
    };

    return (
      <div className="titleBar" style={titleStyle}>
        <h1>
          <EditableItem data={this.props.design.title} ref="title" className="designName"/> 
        </h1>
        <span ref="title" className="appInfos"> {fullTitle} </span>
        <div style={fooStyle}>
          <button onClick={this.handleClick.bind(this)} className="viewOnYm"> View on YM </button>
        </div>
        <span>
          <button onClick={this.handleClick.bind(this)} className="download"> Download </button>
        </span>
        <span>
          <button onClick={this.handleClick.bind(this)} className="share"> Share </button>
        </span>
        <span>
          <button onClick={this.handleClick.bind(this)} className="like"> Like </button>
        </span>
      </div>
    );
  }
}

export default MainToolBar