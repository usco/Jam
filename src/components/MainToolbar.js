import RxReact from 'rx-react';
import React from 'react';
let StateStreamMixin = RxReact.StateStreamMixin;

import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import logger from '../utils/log'
let log = logger("Jam-ToolBar");
log.setLevel("info");



/*validator for design title: why is this here*/
let validateTitle = function( inputTile ){
  return inputTile;
}


let checkForDesignNameAvailability = function( inputTile){

}


var EditableItem = React.createClass({
    getInitialState: function () {
        return {
            isEditMode: false,
            data: ""
        };
    },
    componentWillMount: function () {
        this.setState({
            isEditMode: this.props.isEditMode,
            data: this.props.data
        });
    },
    handleEditCell: function (evt) {
        this.setState({isEditMode: true});

    },
    handleKeyDown: function (evt) {
        switch (evt.keyCode) {
            case 13: // Enter
            case 9: // Tab
                this.setState({isEditMode: false});
                break;
        }
    },
    handleBlur :function (evt) {
      this.setState({isEditMode: false});
    },
    handleChange: function (evt) {
        this.setState({data: evt.target.value});
    },

    componentWillReceiveProps:function(nextProps){
      //console.log(nextProps)
      this.setState({data: nextProps.data});
    },

    render: function () {
        var cellHtml;
        if (this.state.isEditMode) {
            cellHtml = <input type='text' autoFocus value={this.state.data}
                onKeyDown={this.handleKeyDown} onChange={this.handleChange} onBlur={this.handleBlur} /> 
        }
        else {
            cellHtml = <span onClick={this.handleEditCell} onBlur={this.handleBlur} >{this.state.data}</span>
        }
        return cellHtml;
    }
});


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
    return (
      <div>
        <EditableItem data={this.props.design.title} ref="title"/> 
        <span ref="title"> {fullTitle} </span>
        <div>
          <button onClick={this.handleClick.bind(this)} > Test </button>
        </div>
      </div>
    );
  }
}

export default MainToolBar