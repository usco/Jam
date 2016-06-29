/** @jsx hJSX */
import { hJSX } from '@cycle/dom'
import Class from 'classnames'
import { prepend } from 'ramda'
import tooltipIconBtn from '../widgets/TooltipIconButton'
import { generateUUID } from '../../utils/utils'

export default function view (state$) {
  return state$
    .distinctUntilChanged()
    .map(function ({entries, selectedEntries, fieldNames, sortFieldName, sortablesDirection,
      editableFields, fieldDescriptions, fieldTypes, units,
      newEntryValues, toggled, removeEntryRequested, readOnly}) {
      let direction = sortablesDirection
      // const readOnly = true // for testing

      /*const exportIconSvg = `<svg version="1.1" id="Flag" xmlns="http://www.w3.org/2000/svg"
        width="16" height="16" x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="icon">
      <path d="M18.926,5.584c-9.339,13.568-6.142-0.26-14.037,6.357L6.684,19H4.665L1,4.59l1.85-0.664
        c8.849-6.471,4.228,5.82,15.637,1.254C18.851,5.033,19.142,5.27,18.926,5.584z"/>
      </svg>`

      const exportSubItems = <span>
        <button className='bom-as-json' value='bom-as-json'>Export as json</button>
        <button className='bom-as-text' value='bom-as-text'>Export as plain text</button>
      </span>

      const exportButton = tooltipIconBtn(true
        , exportIconSvg, 'exportBOMData', 'export', 'bottom', false, exportSubItems)*/
      const exportButtons = <span >
        <button className='bom-as-json' value='bom-as-json' ><span className='tooltip-bottom' attributes={{'data-tooltip': 'copy to clipboard as Json'}}> json </span> </button>
        <button className='bom-as-text' value='bom-as-text'><span className='tooltip-bottom' attributes={{'data-tooltip': 'copy to clipboard as text'}}> text </span> </button>
        </span>

      // PRIMARY DOM-FUNCTIONS
      function getHeaderRow () {
        let cells = fieldNames.map(function (name) {
          const editable = editableFields.indexOf(name) > -1
          const toolTip = editable ? '(editable) ' + fieldDescriptions[name] : fieldDescriptions[name]
          const columnName = 'column' + fieldNames.indexOf(name)

          let sortArrow = getSortArrow(name, direction)
          const lastInRow = fieldNames.indexOf(name) === (fieldNames.length - 1)
          const thContent = <span className='tooltip-bottom' attributes={{'data-tooltip': toolTip}}>{name} {sortArrow}</span>
          return (
            <th className={`headerCell ${columnName}`}attributes={{'data-name': name, 'colspan': lastInRow ? '1' : '1'}}>
              {thContent}
            </th>
          )
        }).concat([<th className='export'>{exportButtons}</th>]) // for 'hidden field to add/remove entries'
        return (<tr className='headerRow'>
                  {cells}
                </tr>)
      }

      function getAdderRow (adderFieldsArray) {
        return adderFieldsArray.map(function (row, index) {
          const placeholder = 'f.e:velcro, nuts, bolts'
          let cells = getCells(row, placeholder)
          const adder =
            <tr className='adderRow'>
              {cells}
            </tr>
          return adder
        }).concat([])
      }

      function getTableBody (bodyFieldsArray) {
        return bodyFieldsArray.map(function (row, index) {
          let cells = getCells(row)
          return getRow(row, cells, index)
        })
      }

      // HELPER FUNCTIONS
      function getRow (row, cells, index = 0) {
        const selected = selectedEntries.indexOf(row.id) > -1
        if (removeEntryRequested !== undefined && removeEntryRequested.id === row.id) {
          // deletion row
          return (<tr className='test removal' attributes={{'data-name': row.name, 'data-id': row.id}} key={index}>
                   <td className='cell' attributes={{colspan: '100%'}}>
                     <span>This will delete this part (and its copies), are you sure ?</span>
                     <span><button className='confirm' attributes={{'data-name': row.name, 'data-id': row.id}}> Yes </button> <button className='cancel'> No </button></span>
                   </td>
                 </tr>)
        } else {
          // normal row
          return (
            <tr className={Class('test', 'normal', {selected})} attributes={{'data-name': row.name, 'data-id': row.id}} key={index}>
             {cells}
            </tr>
          )
        }
      }

      function getCells (row) {
        const baseClassName = row.hasOwnProperty('_adder') ? 'adder cell' : 'bomEntry cell'
        let cells = fieldNames.map(function (name) {
          const columnName = 'column' + fieldNames.indexOf(name)

          let cellToolTip
          cellToolTip = readOnly ? undefined : cellToolTip // if the field is disabled do not add any extra toolTip

          let value = getInputField(row, name)
          return (<td className={`${baseClassName} ${columnName} ${name}`} attributes={{'data-name': name, 'data-id': row.id}}>
                    {value}
                  </td>)
        })
        if (!readOnly) {
          cells.push(<td className={`${baseClassName} ${'column' + fieldNames.length}`}>
                      {getModifierButton(row)}
                    </td>)
        }
        return cells
      }

      function getModifierButton (row) {
        const isAdder = row.hasOwnProperty('_adder')
        if (isAdder) {
          return (<button type='button' className='addBomEntry'>
                    Add
                  </button>)
        } else {
          return (<button type='button' className='removeBomEntry' attributes={{'data-name': '', 'data-id': row.id}}>
                    <span innerHTML={getIcon('delete')}/>
                  </button>)
        }
      }

      function getSortArrow (name, direction) {
        if (direction !== undefined && sortFieldName === name) {
          if (direction) {
            return <span className='directionArrow'><span className='asc'/></span>
          } else {
            return <span className='directionArrow'><span className='desc'/></span>
          }
        }else if (direction === undefined || sortFieldName !== name) {
          return <span className='directionArrow'><span className='neut'/></span>
        }
      }

      function getInputField (row, name) {
        const placeholder = row.hasOwnProperty('_adder') ? 'f.e:velcro, nuts, bolts' : 'not specified'
        const isDynamic = row.dynamic // row['_qtyOffset'] !== 0 ? true: false //are we dealing with a 'dynamic' entry ie from a 3d file
        const disabled = (isDynamic && (name === 'phys_qty' || name === 'unit')) || readOnly// if readony or if we have a dynamic entry called phys_qty, disable
        const dataValue = (isDynamic && name === 'phys_qty') ? null : row[name]

        switch (fieldTypes[name]) {
          case 'text':
            return <input
                      type='text'
                      value={dataValue}
                      name={name}
                      placeholder={placeholder}
                      disabled={disabled} />
          case 'number':
            const steps = (name === 'qty') ? 1 : 0.01
            const min = isDynamic ? row['_qtyOffset'] : 0
            return <input
                      type='number'
                      value={dataValue}
                      min={min}
                      steps={steps}
                      name={name}
                      disabled={disabled} />
          case 'boolean':
            return <input
                      type='checkbox'
                      checked={dataValue}
                      value={dataValue}
                      name={name}
                      disabled={disabled}
                      key={generateUUID()} /> // VDOM BUG: need to force a new uuid or it will not rerender correctly
          case 'list':
            const options = units.map(unit => <option value={unit} selected={dataValue === unit}>
                                                {unit}
                                              </option>)
            return <select
                      name={name}
                      value={dataValue}
                      disabled={disabled}
                      key={generateUUID()}>
                      //VDOM BUG: need to force a new uuid or it will not rerender correctly
                      {options}
                    </select>
          default:
            return name
        }
      }

      function getIcon (icon) {
        switch (icon) {
          case 'bomToggler':
            return `<svg width="24px" height="21px" viewBox="0 0 24 21" version="1.1" id='List' class='icon'
              xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
                <title>bom</title>
                <desc>Created with Sketch.</desc>
                <defs></defs>
                <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="bom" fill="#000000">
                        <path d="M2.5,5 C3.88071187,5 5,3.88071187 5,2.5 C5,1.11928813 3.88071187,0 2.5,0 C1.11928813,0 0,1.11928813 0,2.5 C0,3.88071187 1.11928813,5 2.5,5 L2.5,5 Z M2.5,4 C1.67157288,4 1,3.32842712 1,2.5 C1,1.67157288 1.67157288,1 2.5,1 C3.32842712,1 4,1.67157288 4,2.5 C4,3.32842712 3.32842712,4 2.5,4 L2.5,4 Z" id="Oval"></path>
                        <polygon id="Shape" points="8.5 3 23.5 3 23.5 2 8.5 2"></polygon>
                        <path d="M2.5,13 C3.88071187,13 5,11.8807119 5,10.5 C5,9.11928813 3.88071187,8 2.5,8 C1.11928813,8 0,9.11928813 0,10.5 C0,11.8807119 1.11928813,13 2.5,13 L2.5,13 Z M2.5,12 C1.67157288,12 1,11.3284271 1,10.5 C1,9.67157288 1.67157288,9 2.5,9 C3.32842712,9 4,9.67157288 4,10.5 C4,11.3284271 3.32842712,12 2.5,12 L2.5,12 Z" id="Oval"></path>
                        <polygon id="Shape" points="8.5 11 23.5 11 23.5 10 8.5 10"></polygon>
                        <path d="M2.5,21 C3.88071187,21 5,19.8807119 5,18.5 C5,17.1192881 3.88071187,16 2.5,16 C1.11928813,16 0,17.1192881 0,18.5 C0,19.8807119 1.11928813,21 2.5,21 L2.5,21 Z M2.5,20 C1.67157288,20 1,19.3284271 1,18.5 C1,17.6715729 1.67157288,17 2.5,17 C3.32842712,17 4,17.6715729 4,18.5 C4,19.3284271 3.32842712,20 2.5,20 L2.5,20 Z" id="Oval"></path>
                        <polygon id="Shape" points="8.5 19 23.5 19 23.5 18 8.5 18"></polygon>
                    </g>
                </g>
            </svg>`
          case 'delete':
            return `<svg version='1.1' id='Trash' xmlns='http://www.w3.org/2000/svg'
              width='16' height='16' x='0px' y='0px' data-icon='duplicate' viewBox='0 0 20 20' class='icon'>
              <path d='M3.389,7.113L4.49,18.021C4.551,18.482,6.777,19.998,10,20c3.225-0.002,5.451-1.518,5.511-1.979l1.102-10.908
              C14.929,8.055,12.412,8.5,10,8.5C7.59,8.5,5.072,8.055,3.389,7.113z M13.168,1.51l-0.859-0.951C11.977,0.086,11.617,0,10.916,0
              H9.085c-0.7,0-1.061,0.086-1.392,0.559L6.834,1.51C4.264,1.959,2.4,3.15,2.4,4.029v0.17C2.4,5.746,5.803,7,10,7
              c4.198,0,7.601-1.254,7.601-2.801v-0.17C17.601,3.15,15.738,1.959,13.168,1.51z M12.07,4.34L11,3H9L7.932,4.34h-1.7
              c0,0,1.862-2.221,2.111-2.522C8.533,1.588,8.727,1.5,8.979,1.5h2.043c0.253,0,0.447,0.088,0.637,0.318
              c0.248,0.301,2.111,2.522,2.111,2.522H12.07z'/>
            </svg>`
          default:
            return '<p>icon</p>'
        }
      }

      function getFieldsArray (property, include = true) {
        // this function can also exclude by property by calling fillFieldsArray('property', false)
        // add editable row for new entries before all the rest
        const uiEntries = readOnly ? entries : prepend(newEntryValues, entries)
        let array = []
        uiEntries.map(function (row, index) {
          if (include && row.hasOwnProperty(property)) {
            array.push(row)
          }
          if (!include && !row.hasOwnProperty(property)) {
            array.push(row)
          }
        })
        return array
      }

      // THIS PART ACTUALLY RETURNS THE BOM
      let content
      let header = getHeaderRow()
      let adder = !readOnly ? getAdderRow(getFieldsArray('_adder')) : null
      let body = getTableBody(getFieldsArray('_adder', false))
      if (toggled) {
        //console.log('entries', entries, entries.length)
        //style={`height: ${(entries.length)*42+60}px`}
        content =
          <div className={Class('tableContainer', {toggled})}>
            <table id='tableheader'>
              {header}
              {adder}
            </table>
            <table id='tablebody'>
              {body}
            </table>
          </div>
      }
      return (
        <div className={Class('bom', {readOnly})}>
          {tooltipIconBtn(toggled, getIcon('bomToggler'), 'containerToggler bomToggler', 'bom/list of parts', 'bottom')}
          {content}
        </div>
      )
    })
}
