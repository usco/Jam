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
      entries:[
        {name:"duplicateEntities"},
        {name:"deleteEntities"}
      ],
      //too specific???
      selectedEntities:[],
      actions:{}
    }
  }

  componentWillReceiveProps(props){
    if("position" in props){
      this.setState({
        position: props.position
      })
    }

    if("actions" in props){
      this.setState({
        actions: props.actions
      })
    }

    if("selectedEntities" in props){
      this.setState({
        selectedEntities: props.selectedEntities
      })
    }

    if("active" in props){
      this.setState({
        active: props.active
      })
    }
  }

  //TODO: replace with RXJS stuff
  handleEntryClick(entryName){
    console.log("here",entryName, this.state, this.state.selectedEntities);


    //no good, that is not generic
    let action = this.state.actions[entryName];
    action(this.state.selectedEntities);


    let self = this;
    this.setState({active:false});//why does this not work ? set state conflict ?render from above at the same time?
    setTimeout(function() {self.setState({active:false})}, 100);

  }

  renderMenuEntries(entries){
    let self = this;
    let entriesDom = []
    entries.map(function(entry){
      entriesDom.push(
        <li> <button onClick={self.handleEntryClick.bind(self,entry.name)}>{entry.name} </button> </li>
      )
    });
    return entriesDom;
  }

  render() {
    let style = {
      left: this.state.position.x,
      top: this.state.position.y,
      position: 'fixed',
      background:'orange',
    };

    let menuEntriesStyle = {
      listStyle: 'none',
      padding:'5px',
      margin:'2px'
    }
    
    let menuEntries = this.renderMenuEntries(this.state.entries);
    let content  = undefined;
    if(this.state && this.state.active){
      content = (
        <ul style={menuEntriesStyle}>
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