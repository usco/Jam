/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"

export default function view (state$) {

  return state$
    .distinctUntilChanged()
    .map(function({entries, selectedEntries
      , fieldNames, sortFieldName, sortablesDirection, toggled}){

      //entries = entries.asMutable()//FIXME: not sure
      console.log("selectedEntries in BOM",selectedEntries)

      let direction = sortablesDirection
      //generate headers
      let headers = fieldNames.map( function(name){
        let sortArrow = undefined

        if( direction !== undefined && sortFieldName === name)
        {
          if(direction){
            sortArrow = <span className="directionArrow"> &#x25B2; </span>
          }else{
            sortArrow = <span className="directionArrow"> &#x25BC; </span>
          }
        }
        return (
          <th className="headerCell" attributes={{"data-name": name}}> 
            {name} {sortArrow}
          </th> 
        )
      })
      
      
      let rows    = entries.map( function(row, index){
        let cells = fieldNames.map(function(name){      
          let value = row[name]//JSON.stringify(row[name])
          if(typeof(row[name]) === "boolean"){
            value = <input type="checkbox" checked={value} />
          }
          return(<td className="bomEntry cell">{value}</td>)
        })

        //cells.push(<td className="bomEntry cell"> <button>Change Model</button> </td>)

        let selected = selectedEntries.indexOf(row.id) > -1
        
        return(
          <tr
            className={Class("bomEntry", {selected: selected})} 
            attributes={{"data-name": row.name, "data-id":row.id}} key={row.id}
            >
            {cells}
          </tr>
        )
      })

      const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="List" class="icon"
        x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve">
        <path fill="#FFFFFF" d="M14.4,9H8.6C8.048,9,8,9.447,8,10s0.048,1,0.6,1h5.8c0.552,0,0.6-0.447,0.6-1S14.952,9,14.4,9z M16.4,14H8.6  C8.048,14,8,14.447,8,15s0.048,1,0.6,1h7.8c0.552,0,0.6-0.447,0.6-1S16.952,14,16.4,14z M8.6,6h7.8C16.952,6,17,5.553,17,5  s-0.048-1-0.6-1H8.6C8.048,4,8,4.447,8,5S8.048,6,8.6,6z M5.4,9H3.6C3.048,9,3,9.447,3,10s0.048,1,0.6,1h1.8C5.952,11,6,10.553,6,10  S5.952,9,5.4,9z M5.4,14H3.6C3.048,14,3,14.447,3,15s0.048,1,0.6,1h1.8C5.952,16,6,15.553,6,15S5.952,14,5.4,14z M5.4,4H3.6  C3.048,4,3,4.447,3,5s0.048,1,0.6,1h1.8C5.952,6,6,5.553,6,5S5.952,4,5.4,4z"/>
        </svg>`

      
      let content = undefined

      if(toggled){
        content = <table >
            <thead>
              <tr>
                {headers}
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table> 
      }

      return (
        <div className="bom">
          <button className={Class("bomToggler", {toggled: toggled})} 
          innerHTML={iconSvg}>
          </button>
          {content}
        </div>
      )
  })
}