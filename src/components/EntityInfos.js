import RxReact from 'rx-react';
import React from 'react';
let StateStreamMixin = RxReact.StateStreamMixin;
let FuncSubject      = RxReact.FuncSubject;

import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import {formatNumberTo, absSizeFromBBox} from '../utils/formatters'

import logger from '../utils/log'
let log = logger("Jam-ToolBar");
log.setLevel("info");

import {setEntityTransforms, setEntityBBox, setEntityColor} from '../actions/entityActions'

/*
  Component to display (& edit) some of the main properties of entities: ie
  - position
  - rotation 
  - scale
*/
class EntityInfos extends RxReact.Component {
  constructor(props) {
    super(props);
    this.state={entityName:""}
    this.keyup = FuncSubject.create();

    this.degreeAngles = true;
  }

  componentWillReceiveProps(nextProps){
    let entities = nextProps.entities;
    if(entities && entities.length >0 )
    {
      this.setState({
        entityName:entities[0].name
      })
    }
  }

  getStateStream() {
    //return (
    //  Observable.empty());
    function loggg(text){
      console.log("here",text)
      return text
    }
    return (
      this.keyup
      .map((e) => e.target.value)
      .filter(text => text.length > 2)
      //.throttle(750)
      .distinctUntilChanged()
      //.flatMapLatest(text => searchWikipedia(text))
      //.map(loggg)
      .map(results => ({entityName: results}))
    );
  }

  _keyup(event){
    console.log(event)
    this.setState({results: event.target.value});
  }

  handleChange(type, index, event) {
    //console.log(type, index, parseFloat(event.target.value));
    //this.setState({value: event.target.value});
    let entity= this.props.entities[0] ;
    let transforms = {
      pos:Object.assign([],entity.pos),
      rot:Object.assign([],entity.rot),
      sca:Object.assign([],entity.sca),
    };
    transforms[type][index]=parseFloat(event.target.value);
    
    setEntityTransforms({entity,transforms})
  }

  handleSizeChange(index, event) {
    console.log("handling size change", index, parseFloat(event.target.value));
    //this.setState({value: event.target.value});
    let entity= this.props.entities[0] ;
    let bbox = {
      min:Object.assign([],entity.bbox.min),
      max:Object.assign([],entity.bbox.max),
    };
    let value = parseFloat(event.target.value);
    //attrs[type][index]=parseFloat(event.target.value);
    //TODO: convert abs size to bbox
    //bbox.min[index] = value/2;
    //bbox.max[index] = value/2;
    
    setEntityBBox({entity, bbox});
  }


  handleAngleInput(event){
    let value = event.target.value;
  }

  handleColorChange(event){

    let entity= this.props.entities[0] ;
    let color = event.target.value;
    setEntityColor({entity, color});
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

    /*let entity ={
      name:"foo",
      type:"yeah",
      pos : [10,0,-7],
      rot : [0,0,7],
      sca: [0,0,0]
    }*/
    let entityInfo;
    let canDisplay = this.props.entities.length>0;
    let debug  = this.props.debug || false;

    let numberPrecision = 2;
    let controlsStep = 0.1;

    var entityName = this.state && this.state.entityName || [];


    if(canDisplay){
      let entity= this.props.entities[0] ;
      //let absSize = toAbsSize(entity.sca)

      let self  = this;//workaround for babel + jsx "this" issue

      let positionInputs = [];
      entity.pos.forEach(function(entry, index){
        let entry = formatNumberTo(entry, numberPrecision);
        positionInputs.push(<input type="number" 
          value={entry} 
          step= {controlsStep}
          style={styles.numbers} 
          onChange={self.handleChange.bind(self,"pos",index)} />
        );
      })

      let rotationInputs = [];
      entity.rot.forEach(function(entry, index){
        let entry = formatNumberTo(entry, numberPrecision);
        rotationInputs.push(<input type="number"
          value={entry} 
          step = {controlsStep}
          style={styles.numbers}
          onChange={self.handleChange.bind(self,"rot",index)} />
        );
      })

      let scaleInputs = [];
      entity.sca.forEach(function(entry, index){
        let entry = formatNumberTo(entry, numberPrecision);
        scaleInputs.push(
          <input type="number" 
          value={entry} 
          step={controlsStep}
          style={styles.numbers}
          onChange={self.handleChange.bind(self,"sca",index)} />
        );
      })

      let absSizeInputs = [];
      let absSize = absSizeFromBBox(entity.bbox);
      absSize = absSize || {w:0,l:0,h:0};
      //convert to array to keep logic the same for all fields
      absSize = [absSize.w,absSize.l,absSize.h];
      absSize.forEach(function(entry, index){
        let entry = formatNumberTo(entry, numberPrecision);
        absSizeInputs.push(
          <input type="number" 
          value={entry} 
          step={controlsStep}
          style={styles.numbers} onChange={self.handleSizeChange.bind(self,index)}/>
        );
      })

      let debugFields = undefined;

      if(debug){
        debugFields = <div>
          <span> iuid: </span> <span>{entity.iuid}</span>
          <span> tuid: </span> <span>{entity.typeUid}</span>
          </div>
      }


      entityInfo = (
        <div>
          <span>
            <input type="color" value={entity.color} onChange={this.handleColorChange.bind(this)}/> 
          </span>
          <span>
            <span>N:</span>
            <input type="text" value={entityName} style={styles.text} onChange={this.keyup.bind(this)}> </input>
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
          <span>
            <span>D:</span> {absSizeInputs}
          </span>
          {debugFields}
        </div>)
    }
    
    return (
      <div>
       {entityInfo}
      </div>
    );
  }
}

export default EntityInfos