/** @jsx hJSX */
import Cycle from '@cycle/core'
import Rx from 'rx'
import {hJSX} from '@cycle/dom'
import Class from "classnames"
import {prepend} from 'ramda'

import tooltipIconBtn from '../widgets/TooltipIconButton'

import {generateUUID} from '../../utils/utils'



export default function view (state$) {

  return state$
    .distinctUntilChanged()
    .map(function({entries, selectedEntries
      , fieldNames, sortFieldName, sortablesDirection, editableFields, fieldDescriptions,fieldTypes, units, newEntryValues, toggled, readOnly}){

      //entries = entries.asMutable()//FIXME: not sure
      //console.log( "selectedEntries in BOM",selectedEntries)

      let direction = sortablesDirection
      //generate headers
      let headers = fieldNames.map( function(name){
        let sortArrow = undefined
        const editable = editableFields.indexOf(name) > -1
        const toolTip  = editable? '(editable) '+fieldDescriptions[name] : fieldDescriptions[name]

        if( direction !== undefined && sortFieldName === name)
        {
          if(direction){
            sortArrow = <span className="directionArrow"> &#x25B2; </span>
          }else{
            sortArrow = <span className="directionArrow"> &#x25BC; </span>
          }
        }
        //className={Class(`tooltip-bottom`),
        return (
          <th className="headerCell" attributes={{"data-name": name}}>
          <span className='tooltip-bottom' attributes={{"data-tooltip": toolTip}}>{name}</span> {sortArrow}
          </th>
        )
      })

      //add editable row for new entries before all the rest
      const uiEntries = readOnly? entries: prepend(newEntryValues, entries)

      let rows    = uiEntries.map( function(row, index){
        const isDynamic = row.dynamic//row['_qtyOffset'] !== 0 ? true: false //are we dealing with a "dynamic" entry ie from a 3d file
        const isAdder   = row.hasOwnProperty('_adder')
        const baseClassName = "bomEntry cell"

        let cells = fieldNames.map(function(name){
          let cellToolTip = undefined

          //console.log("name",name,"value",value)

          //special case for quantities
          if(name === 'qty'){
            const qtyOffset = row['_qtyOffset']
            //cellToolTip = value>0 ? `Manually added items:${qtyOffset}` : undefined
            //value +=  qtyOffset// we add quantity offset (dynamic quantities , inferable from assembly)
          }
          cellToolTip = readOnly? undefined: cellToolTip//if the field is disabled do not add any extra toolTip

          const disabled  = (isDynamic && (name ==='phys_qty' || name === 'unit' )) || readOnly //if readony or if we have a dynamic entry called phys_qty, disable
          const dataValue = (isDynamic && name ==='phys_qty')? 'n/a' : row[name]

        //  console.log("dataValue", dataValue,units)
          let value = ''
          switch(fieldTypes[name]){
            case 'text':
              const placeholder = isAdder? 'f.e:velcro, nuts, bolts' : 'not specified'
              value = <input type="text" value={dataValue} name={name} placeholder={placeholder} disabled={disabled} />
            break;
            case 'number':
              const steps = (name === 'qty')? 1:0.01
              const min   = isDynamic? row['_qtyOffset'] : 0
              value = <input type="number" value={dataValue} min={min} steps={steps} name={name} disabled={disabled} />
              //<span className="tooltip-bottom" attributes={{"data-tooltip": cellToolTip}} >
              //</span>
            break;
            case 'list'://FIXME : not generic, only works for unit// selected={dataValue}
              const options = units.map(unit=><option value={unit} selected={dataValue === unit}> {unit}</option>)
              value = <select name={name}  value={dataValue}disabled={disabled} key={generateUUID()}> //VDOM BUG: need to force a new uuid or it will not rerender correctly
                {options}
              </select>
            break;
            case 'boolean':
              value = <input type="checkbox" checked={dataValue} value={dataValue} name={name}  disabled={disabled} key={generateUUID()}/> //VDOM BUG: need to force a new uuid or it will not rerender correctly
            break;
            default:
              value = `${value}`
            break;
          }

          return(<td className={`${baseClassName} ${name}`} attributes={{"data-name": name, "data-id":row.id}} >{value}</td>)
        })

        if(isAdder){
          cells.push(<td className={baseClassName}> <button type='button' className='addBomEntry' >Add</button> </td>)
        }else{

          const deleteIconSvg = `<svg version="1.1" id="Trash" xmlns="http://www.w3.org/2000/svg"
            width="16" height="16" x="0px" y="0px" data-icon="duplicate" viewBox="0 0 20 20" class="icon">
            <path d="M3.389,7.113L4.49,18.021C4.551,18.482,6.777,19.998,10,20c3.225-0.002,5.451-1.518,5.511-1.979l1.102-10.908
            C14.929,8.055,12.412,8.5,10,8.5C7.59,8.5,5.072,8.055,3.389,7.113z M13.168,1.51l-0.859-0.951C11.977,0.086,11.617,0,10.916,0
            H9.085c-0.7,0-1.061,0.086-1.392,0.559L6.834,1.51C4.264,1.959,2.4,3.15,2.4,4.029v0.17C2.4,5.746,5.803,7,10,7
            c4.198,0,7.601-1.254,7.601-2.801v-0.17C17.601,3.15,15.738,1.959,13.168,1.51z M12.07,4.34L11,3H9L7.932,4.34h-1.7
            c0,0,1.862-2.221,2.111-2.522C8.533,1.588,8.727,1.5,8.979,1.5h2.043c0.253,0,0.447,0.088,0.637,0.318
            c0.248,0.301,2.111,2.522,2.111,2.522H12.07z"/>
          </svg>`

          const removerCell = <td className={baseClassName}>
            <button type='button' className='removeBomEntry' attributes={{"data-name": name, "data-id":row.id}}>
              <span innerHTML={deleteIconSvg}/>
            </button>
          </td>

          cells.push(removerCell)
        }

        const selected = selectedEntries.indexOf(row.id) > -1

        return(
          <tr
            className={Class("bomEntry", {selected, adder:isAdder, normal:!isAdder})}
            attributes={{"data-name": row.name, "data-id":row.id}} key={index}
            >
              {cells}
          </tr>
        )
      })

      //add editable row for new entries before all the rest
      /*function createAddNewEntryEditorLine(){


        let cells = fieldNames.map(function(name){


        })

        return(
          <tr
            className={Class("bomEntry")}
            attributes={{"data-name": 'newEntry', "data-id":undefined}} key='newEntry'
            >
          </tr>
        )
      }
      rows = prepend(createAddNewEntryEditorLine(),rows)
      console.log("rows",rows)*/

      const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="List" class="icon"
        x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve">
        <path fill="#FFFFFF" d="M14.4,9H8.6C8.048,9,8,9.447,8,10s0.048,1,0.6,1h5.8c0.552,0,0.6-0.447,0.6-1S14.952,9,14.4,9z M16.4,14H8.6  C8.048,14,8,14.447,8,15s0.048,1,0.6,1h7.8c0.552,0,0.6-0.447,0.6-1S16.952,14,16.4,14z M8.6,6h7.8C16.952,6,17,5.553,17,5  s-0.048-1-0.6-1H8.6C8.048,4,8,4.447,8,5S8.048,6,8.6,6z M5.4,9H3.6C3.048,9,3,9.447,3,10s0.048,1,0.6,1h1.8C5.952,11,6,10.553,6,10  S5.952,9,5.4,9z M5.4,14H3.6C3.048,14,3,14.447,3,15s0.048,1,0.6,1h1.8C5.952,16,6,15.553,6,15S5.952,14,5.4,14z M5.4,4H3.6  C3.048,4,3,4.447,3,5s0.048,1,0.6,1h1.8C5.952,6,6,5.553,6,5S5.952,4,5.4,4z"/>
        </svg>`


      let content = undefined

      if(toggled){
        content =
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
      }

      return (
        <div className="bom">
          {tooltipIconBtn(toggled
            , iconSvg, "bomToggler", "bom/list of parts", "left")}
          {content}
        </div>
      )
  })
}
