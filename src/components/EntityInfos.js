import RxReact from 'rx-react';
import React from 'react';
let StateStreamMixin = RxReact.StateStreamMixin;

import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import logger from '../utils/log'
let log = logger("Jam-ToolBar");
log.setLevel("info");

/*
  Component to display (& edit) some of the main properties of entities: ie
  - position
  - rotation 
  - scale
*/
class EntityInfos extends RxReact.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  getStateStream() {
    return Observable.empty()
  }
  
  render() {
    //let styles = Object.assign({}, this.constructor.styles);
    let styles ={
      numbers:{
        width:"10em",
        maxWidth: "50px",
        border: "none",
        lineHeight: "0.8em",
        fontSize: "0.8em",
        fontFamily: "inherit",
      },
      text:{
        maxWidth: "150px",
        border: "none",
        lineHeight: "0.8em",
        fontSize: "0.8em",
        fontFamily: "inherit",
      }

    }

    let fieldStyle={
      width:"10em",
      maxWidth: "50px",
      border: "none",
      lineHeight: "0.8em",
      fontSize: "0.8em",
      fontFamily: "inherit",
    }

    let entity ={
      name:"foo",
      type:"yeah",
      pos : [10,0,-7],
      rot : [0,0,7],
      scale: [0,0,0]
    }

    let positionInputs = [];
    entity.pos.forEach(function(entry){
      positionInputs.push(<input type="number" value={entry} style={styles.numbers}/>);
    })

    let rotationInputs = [];
    entity.rot.forEach(function(entry){
      rotationInputs.push(<input type="number" value={entry} style={styles.numbers}/>);
    })

    let scaleInputs = [];
    entity.scale.forEach(function(entry){
      scaleInputs.push(<input type="number" value={entry} style={styles.numbers}/>);
    })

    return (
      <div>
        <span>
          <span>N:</span><input type="text"value={entity.name} style={styles.text}>  </input>
        </span>
        <span>
          <span>P:</span> {positionInputs}
        </span>
        <span>
          <span>R:</span> {rotationInputs}
        </span>
        <span>
          <span>S:</span> {scaleInputs}
        </span>
      </div>
    );
  }
}

export default EntityInfos