import RxReact from 'rx-react';
import React from 'react';
let StateStreamMixin = RxReact.StateStreamMixin;

import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import logger from '../utils/log'
let log = logger("Jam-ToolBar");
log.setLevel("info");


class MainToolBar extends RxReact.Component {
  constructor(props) {
    super(props);
    this.state = {
      design:{
        title:"unnamed design",
      },
      appInfos:{
        name:"bla",
        version:"0.0.0"
      }
    }
  }

  getStateStream() {
    return Observable.empty()
  }
  
  render() {
    log.info("bla",this.props)
    let fullTitle = `${this.props.design.title} ---- ${this.state.appInfos.name} v  ${this.state.appInfos.version}`;

    return (
      <div>
        <div ref="title"> {fullTitle} </div>
        <div>
          <button> Test </button>
        </div>
      </div>
    );
  }
}

export default MainToolBar