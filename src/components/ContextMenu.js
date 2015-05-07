import React from 'react';

//TODO: make entries configurable etc..hence "CONTEXT"

export default class ContextMenu extends React.Component {
 
 constructor(props) {
    super(props);
    this.state = {
      active:false,
      position:{
        x:0,
        y:0
      },
      //too specific???
      selectedEntities:[],
      actions:[]
    }
  }

  componentWillReceiveProps(props){

    const DEFAULTS = {
      active:false,
      position:{x:0,y:0},
      actions:[],
      selectedEntities:[]
    }

    if("settings" in props){
      if(props.settings){
        let state = Object.assign({}, this.state, props.settings);
        this.setState(state);
      }
    }
  }

  //TODO: replace with RXJS stuff
  handleEntryClick(entryAction){
    console.log("here",entryAction, this.state, this.state.selectedEntities);


    //no good, that is not generic
    let action = entryAction;//this.state.actions[entryName];
    action(this.state.selectedEntities);


    let self = this;
    this.setState({active:false});//why does this not work ? set state conflict ?render from above at the same time?
    setTimeout(function() {self.setState({active:false})}, 100);

  }

  renderMenuEntries(actions= [], level=0){
    let self = this;
    let entriesDom = [];

    let offsetStyle = {
     paddingLeft:`${level*20}px`
    };

    actions.map(function(entry){
      entriesDom.push(
        <li style={offsetStyle}> 
          <button onClick={self.handleEntryClick.bind(self,entry.action)}> {entry.name} </button> 
          {entry.items ? '>' : ''}
          {entry.items ? self.renderMenuEntries(entry.items, 1) : ''}
        </li>
      )
    });

    return entriesDom;
  }

  render() {
    let style = {
      left: this.state.position.x,
      top: this.state.position.y,
      position: 'fixed',
      /*background:'orange',*/
    };

    let menuEntriesStyle = {
      /*listStyle: 'none',
      padding:'5px',
      margin:'2px'*/
    }
    
    let menuEntries = this.renderMenuEntries(this.state.actions);
    let content  = undefined;

    if(this.state && this.state.active){
      content = (
        <ul style={menuEntriesStyle} className="menuEntries">
          {menuEntries}
        </ul>
      );
    }

    return (
      <div className="contextMenu" style={style}>
        {content}
      </div>
    );
  }

}