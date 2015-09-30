/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'

import Classes from 'classnames'

import {trim} from '../utils/utils'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'


function EditableItem(interactions, props) {
  let multiline$   = props$.map('multiline').filter(exists).startWith(false)
  let placeholder$ = props$.map('placeholder').startWith("")
  let editable$    = props$.map('editable').filter(exists).startWith(true)
  let data$        = props$.map('data').startWith("")

  let keydowns$ = DOM.select('.textInput').events('keydown')
  let keyups$   = DOM.select('.textInput').events('keyup')

  let valueChange$ = DOM.select('valueChange')

  let editing$     = Rx.Observable.merge(
    DOM.select('editing').map(true),//interactions.get('.textInput','click')
    DOM.select('blur').map(false),//interactions.get('.textInput','blur')
    keydowns$.filter(e=>!e.shiftKey).map(e => e.keyCode).filter(k => k ===13).map(false), //if we press enter (not shift+enter), stop editing
    keydowns$.map(e => e.keyCode).filter(k => k ===27).map(false) //if we press exit, stop editing
  ).startWith(false)

  //just a small helper
  function eventer(eventName, eventContent){
    return DOM.select(eventName).onEvent //(eventContent)
  }

  //FIXME: HAAAACK!
  let changeHandler$ = props$.map('changeHandler').startWith(undefined)
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
    DOM: vtree$,
    events:{
      valueChange$
    }
  }
}

export default EditableItem