import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from 'classnames'

import {trim} from '../utils/utils'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'


function EditableItem(interactions, props) {
  //let selectionTransforms$ = interactions.subject('selectionTransforms$')
  let multiline$   = props.get('multiline').filter(exists).startWith(false)
  let placeholder$ = props.get('placeholder').startWith("")
  let editable$    = props.get('editable').filter(exists).startWith(false)
  let data$        = props.get('data').startWith("")

  let editing$     = props.get('editing').filter(exists).startWith(false)
  
  let vtree$ = Rx.Observable
    .combineLatest(
      editing$,
      multiline$,
      placeholder$,
      editable$,
      data$,
      function(editing,multiline,placeholder,editable,data){
      
        //onKeyDown={this.handleKeyDown} onChange={this.handleChange} onBlur={this.handleBlur} 
        //onKeyDown={this.handleKeyDown} onChange={this.handleChange} onBlur={this.handleBlur}
        //onClick={this.handleEditCell} onBlur={this.handleBlur} >{value}{placeholder}
        function changeHandler(fieldName, index, event){   
        }

        let element =null

        if(data || data !== "" ) placeholder = ""

        let value = data
        if(!value || trim(value) === ""){
          value = undefined
        }


         if (editing && editable) {
          if(multiline){
            element = <textarea 
            className="textInput"
            autoFocus 
            value={value}/> 
          }else{
            element = <input type='text' 
            className="textInput"
            autoFocus 
            value={value}
            placeholder={placeholder}/>           
          }
        }
        else {
          element = <span className="textInput">{value}{placeholder}</span>
        }


        return element
      })

  return {
    view: vtree$,
    events:{
    }
  }
}

let EditableItem = Cycle.component('EditableItem',EditableItem)
export default EditableItem