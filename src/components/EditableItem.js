import React from 'react'
import {trim} from '../utils/utils'

 
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
      /*const defauts = {
        data:undefined,
        placeholder:""
      }*/
      let nextState = Object.assign({},this.state,nextProps)

      this.setState(nextState);//{data: data, placeholder})
    },

    render: function () {
      let cellHtml
      let placeholder = this.state.placeholder
      if(this.state.data || this.state.data !== "" ) placeholder = ""

      let value = this.state.data
      if(!value || trim(value) === ""){
        placeholder = this.state.placeholder
        value = undefined
      }

      //console.log("value",value)
      //console.log("placeholder",placeholder)

      if (this.state.isEditMode && this.state.editable) {
        if(this.state.multiline){
          cellHtml = <textarea 
          className="textInput"
          autoFocus 
          value={value}
          onKeyDown={this.handleKeyDown} onChange={this.handleChange} onBlur={this.handleBlur} /> 
        }else{
          cellHtml = <input type='text' 
          className="textInput"
          autoFocus 
          value={value}
          placeholder={placeholder}
          onKeyDown={this.handleKeyDown} onChange={this.handleChange} onBlur={this.handleBlur} />           
        }
      }
      else {
        
        cellHtml = <span className="textInput" 
        onClick={this.handleEditCell} onBlur={this.handleBlur} >{value}{placeholder}</span>
      }
      return cellHtml
    }
})

export default EditableItem