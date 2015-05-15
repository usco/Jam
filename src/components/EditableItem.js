import React from 'react'


let EditableItem = React.createClass({
    getInitialState: function () {
      return {
        isEditMode: false,
        multiline: false,
        placeholder:"",
        editable: false,
        data: ""
      }
    },
    componentWillMount: function () {
      this.setState({
        isEditMode: this.props.isEditMode,
        multiline: this.props.multiline || false,
        placeholder: this.props.placeholder || "",
        editable : this.props.editable || true,
        data: this.props.data
      })
    },

    handleEditCell: function (evt) {
      this.setState({isEditMode: true})
    },

    handleKeyDown: function (evt) {
      switch (evt.keyCode) {
        case 13: // Enter
          if (evt.shiftKey !== true){
            this.setState({isEditMode: false})
          }
          break
        case 9: // Tab
          this.setState({isEditMode: false})
          break
      }
    },

    handleBlur :function (evt) {
      this.setState({isEditMode: false})
    },

    handleChange: function (evt) {
      //this.setState({data: evt.target.value})
      this.onChangeItem(evt.target.value)
    },

    onChangeItem: function(value){
      this.setState({data:value})
      if(this.props.changeCallback){
        this.props.changeCallback(value)
      }
    },

    componentWillReceiveProps:function(nextProps){
      //console.log(nextProps)
      let data = nextProps.data || ""
      this.setState({data: data})
    },

    render: function () {
      let cellHtml
      let placeholder = this.state.placeholder
      if(this.state.data || this.state.data !== "" ) placeholder = ""

      if (this.state.isEditMode && this.state.editable) {
        if(this.state.multiline){
          cellHtml = <textarea autoFocus value={this.state.data}
          onKeyDown={this.handleKeyDown} onChange={this.handleChange} onBlur={this.handleBlur} /> 
        }else{
          cellHtml = <input type='text' autoFocus 
          value={this.state.data}
          placeholder={this.state.placeholder}
          onKeyDown={this.handleKeyDown} onChange={this.handleChange} onBlur={this.handleBlur} />           
        }
      }
      else {
        cellHtml = <span onClick={this.handleEditCell} onBlur={this.handleBlur} >{this.state.data} {placeholder}</span>
      }
      return cellHtml
    }
})

export default EditableItem