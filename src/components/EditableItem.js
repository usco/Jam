import RxReact from 'rx-react';
import React from 'react';


let EditableItem = React.createClass({
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
      let data = nextProps.data || "";
      this.setState({data: data});
    },

    render: function () {
      let cellHtml;
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

export default EditableItem;