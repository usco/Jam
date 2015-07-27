import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Classes from 'classnames'

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
    keydowns$.filter(e=>!e.shiftKey).map(e => e.keyCode).filter(k => k ===13).map(false), //if we press enter (not shift+enter), stop editing
    keydowns$.map(e => e.keyCode).filter(k => k ===27).map(false) //if we press exit, stop editing
  ).startWith(false)

  //just a small helper
  function eventer(eventName, eventContent){
    return interactions.subject(eventName).onEvent //(eventContent)
  }

  //FIXME: HAAAACK!
  let changeHandler$ = props.get('changeHandler').startWith(undefined)
  valueChange$
    .withLatestFrom(changeHandler$ ,function(e,changeHandler){
      if(changeHandler) changeHandler(e)
  })
  .subscribe(e=>e)
  
  let vtree$ = Rx.Observable
    .combineLatest(
      editing$,
      multiline$,
      placeholder$,
      editable$,
      data$,
      function(editing,multiline,placeholder,editable,data){
        let element =null
        let placeholderMode = true

        if(data || data !== "" && data!==undefined && data !== null ){
          placeholder = ""
          placeholderMode = false
        }

        let value = data
        if(!value || trim(value) === ""){
          value = undefined
        }

        if(value) 
          trim(value)


        let classNames = Classes("textInput", { "placeholder": placeholderMode } )

        if (editing && editable) {
          if(multiline){
            element = <textarea 
            className= { classNames }
            autoFocus 
            value={value}
            onBlur={eventer('blur')}
            onKeyDown={eventer('keydown')}
            onKeyUp={eventer('keyup')}
            onChange={eventer('valueChange')} 
            /> 
          }else{
            element = <input type='text' 
            className= { classNames }
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
          element = <span className= { classNames }
            onClick={eventer('editing')} >
            {value} {placeholder}
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

EditableItem = Cycle.component('EditableItem',EditableItem)
export default EditableItem