/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from "classnames"

export default function view (state$) {

  return state$
    .distinctUntilChanged()
    .map(function({entries, selectedEntries
      , fieldNames, sortFieldName, sortablesDirection}){

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

      return (
        <div className="bom">
          <table >
            <thead>
              <tr>
                {headers}
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table> 
        </div>
      )
  })
}