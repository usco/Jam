import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from "classnames"
let combineLatest =Rx.Observable.combineLatest

import combineTemplate from 'rx.observable.combinetemplate'
import {exists} from '../utils/obsUtils'


function ContextMenuItems(interactions,props){
  let active$ = props.get('active').startWith(true)
  let items$  = props.get('items').startWith([])

  let vtree$ = 
    combineLatest(
      active$,
      items$,
      function(active,items){

        let itemsEls = null
        itemsEls = items.map(function(item){
          let itemEl= null
          if("items" in item){
            let style = { "paddingLeft":"20px" }

            itemEl = ( <span> 
              {item.text} >
                <ContextMenuItems items={item.items} active={true} style={style}/> 
            </span> )
          }else
          {
            itemEl = item.text
          }
          return(
            <li className={ `menuEntries ${item.action}` } data-action={item.action}>
            {itemEl}
            </li>
          )
        })

        if(active){
          return (
            <ul className="menuEntries">
              {itemsEls}
            </ul>
          )
        }
      }
  )

  return {
    view: vtree$
  }
}

let ContextMenuItems = Cycle.component('ContextMenuItems', ContextMenuItems)

//fyi for now, we hardcode some of the ui 
function ContextMenu(interactions, props) {

  let active$     = props.get('active').startWith(false)
  let position$   = props.get('position').startWith({x:0,y:0})
  let selections$ = props.get('selections').filter(exists).startWith([])
  let items$      = props.get('items').filter(exists).startWith([])

  let actionSelected$ = interactions.get(".contextMenu .menuEntries", "click")
    .map(e=>e.target.attributes["data-action"])
    .filter(exists)
    .map(d=>d.value)
    .combineLatest(selections$,function(action, selections){
      return {action,selections}
    })
    //.subscribe(e=>console.log("click delete inside contextMenu",e))


  let vtree$ = 
    combineLatest(
      active$,
      position$,
      selections$,
      items$,
      function(active,position,selections,items){

        let content = null
        if(position){
          console.log("showing ContextMenu", selections)

          let style = {
            left: position.x,
            top:  position.y,
            position: 'fixed'
          }

          content =(
            <div className="contextMenu" style={style}>
              <ContextMenuItems items={items} active={true} />
            </div>
          )
        }

        return content
      }
    )

  return {
    view: vtree$,
    events: {
      actionSelected$
    }
  }
}



let ContextMenu = Cycle.component('ContextMenu',ContextMenu)
export default ContextMenu