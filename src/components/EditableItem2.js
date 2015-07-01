import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from 'classnames'

import {trim} from '../utils/utils'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'


function EditableItem(interactions, props) {
  let multiline$   = props.get('multiline').filter(exists).startWith(false)
  let placeholder$ = props.get('placeholder').startWith("")
  let editable$    = props.get('editable').filter(exists).startWith(true)
  let data$        = props.get('data').startWith("")

  let keydowns$ = interactions.subject('keydown')//.get('.textInput','keydown')
  let keyups$   = interactions.subject('keyup') //.get('.textInput','keyups')

  let valueChange$ = interactions.subject('valueChange')
  //let changes$  = interactions.subject('valueChange').map(e=>e.target).map(eventer("changes$"))
    //changes$.subscribe(data=>console.log("CHANGES",data))

  let editing$     = Rx.Observable.merge(
    interactions.subject('editing').map(true),//interactions.get('.textInput','click')
    interactions.subject('blur').map(false),//interactions.get('.textInput','blur')
    keydowns$.map(e => e.keyCode).filter(k => k ===13).map(false) //if we press enter, stop editing
  ).startWith(false)

  //just a small helper
  function eventer(eventName, eventContent){
    return interactions.subject(eventName).onEvent //(eventContent)
  }
  
  let vtree$ = Rx.Observable
    .combineLatest(
      editing$,
      multiline$,
      placeholder$,
      editable$,
      data$,
      function(editing,multiline,placeholder,editable,data){
        console.log("change to EditableItem",editing)

        let element =null

        if(data || data !== "" ) placeholder = ""

        let value = data
        if(!value || trim(value) === ""){
          value = undefined
        }
        if(value) trim(value)

         if (editing && editable) {
          if(multiline){
            element = <textarea 
            className="textInput"
            autoFocus 
            value={value}
            onBlur={eventer('blur')}
            onKeyDown={eventer('keydown')}
            onKeyUp={eventer('keyup')}
            onChange={eventer('valueChange')} 
            /> 
          }else{
            element = <input type='text' 
            className="textInput"
            autoFocus 
            value={value}
            placeholder={placeholder}
            onBlur={eventer('blur')}
            onKeyDown={eventer('keydown')}
            onKeyUp={eventer('keyup')}
            onChange={eventer('valueChange')} 
            />           
          }
        }
        else {
          element = <span className="textInput"
            onClick={eventer('editing')} >
            {value}{placeholder}
          </span>
        }


        return element
      })

  return {
    view: vtree$,
    events:{
      valueChange$
    }
  }
}

let EditableItem = Cycle.component('EditableItem',EditableItem)
export default EditableItem