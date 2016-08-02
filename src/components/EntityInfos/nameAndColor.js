import {html} from 'snabbdom-jsx'
import Menu from '../widgets/Menu'
import checkbox from '../widgets/Checkbox'

const icon = `<svg viewBox="0 0 23 24" preserveAspectRatio="xMidYMid meet" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>color</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="color" fill="#000000">
            <path d="M19.3535534,12.1464466 L10.3535534,3.14644661 L10,2.79289322 L9.64644661,3.14644661 L1.14644661,11.6464466 C0.170222152,12.6226711 0.170222152,14.2050791 1.14622048,15.1823271 L5.81848445,19.8535912 C6.79470876,20.8298155 8.37729124,20.8298155 9.35355339,19.8535534 L16.3535534,12.8535534 L16,13 L19,13 L20.2071068,13 L19.3535534,12.1464466 L19.3535534,12.1464466 Z M18.6464466,12.8535534 L19,12 L16,12 L15.7928932,12 L15.6464466,12.1464466 L8.64644661,19.1464466 C8.06070876,19.7321845 7.11129124,19.7321845 6.52555339,19.1464466 L1.85351555,14.4754088 C1.26777785,13.8889209 1.26777785,12.9393289 1.85355339,12.3535534 L10.3535534,3.85355339 L9.64644661,3.85355339 L18.6464466,12.8535534 L18.6464466,12.8535534 Z" id="Shape"></path>
            <path d="M10,10.5 L10,2.5 C10,1.12316384 8.87644873,0 7.5,0 C6.12355127,0 5,1.12316384 5,2.5 L5,8.016 L6,8.016 L6,2.5 C6,1.67552581 6.67575883,1 7.5,1 C8.32424117,1 9,1.67552581 9,2.5 L9,10.5 L10,10.5 L10,10.5 Z" id="Shape"></path>
            <path d="M22,21 C22,22.1048576 21.1048576,23 20,23 C18.8951424,23 18,22.1048576 18,21 C18,20.6075108 18.3032737,19.7720461 18.8274131,18.6906886 C18.9409908,18.4563652 19.0635031,18.2130979 19.1936439,17.9627331 C19.4635254,17.4435351 19.7531787,16.918301 20.0428613,16.4143497 C20.2165301,16.112224 20.3512565,15.8849328 20.4274316,15.7594268 L19.5725684,15.7594268 C19.6487435,15.8849328 19.7834699,16.112224 19.9571387,16.4143497 C20.2468213,16.918301 20.5364746,17.4435351 20.8063561,17.9627331 C20.9364969,18.2130979 21.0590092,18.4563652 21.1725869,18.6906886 C21.6967263,19.7720461 22,20.6075108 22,21 L22,21 Z M23,21 C23,20.3997163 22.6652327,19.4774924 22.0724517,18.2545196 C21.9546136,18.0114066 21.8279288,17.7598542 21.6936439,17.5015169 C21.4166504,16.9686367 21.1203662,16.4313787 20.8241113,15.9159941 C20.6462176,15.6065182 20.5075065,15.3725047 20.4274316,15.2405732 L20,14.536337 L19.5725684,15.2405732 C19.4924935,15.3725047 19.3537824,15.6065182 19.1758887,15.9159941 C18.8796338,16.4313787 18.5833496,16.9686367 18.3063561,17.5015169 C18.1720712,17.7598542 18.0453864,18.0114066 17.9275483,18.2545196 C17.3347673,19.4774924 17,20.3997163 17,21 C17,22.6571424 18.3428576,24 20,24 C21.6571424,24 23,22.6571424 23,21 L23,21 Z" id="Shape"></path>
        </g>
    </g>
</svg>`

export function renderNameAndColorUi (state) {
  const settings = state.settings
  const activeTool = settings.activeTool
  const toggled = activeTool === 'nameAndColor'

  const data = state.selections.instIds.reduce(function (acc, id) {
    acc['transforms'].push(state.transforms[id])
    acc['meta'].push(state.meta[id])
    return acc
  }, {transforms: [], meta: [], settings})

  let meta = data.meta.length > 0 ? data.meta[0] : data.meta
  meta = meta || {name: undefined, color: '#FFFFFF'}

  const subTools = <span className='nameAndColorSubTools'>
    <div className='formGroup'>
      <span>
        <label htmlfor='entityName' > Name: </label>
        <span className='inputWrapper'>
          <input type='text' name='entityName' value={meta.name} className='nameInput' placeholder='Type name here...' />
        </span>
      </span>

      <span>
        <label htmlfor='entityColor' > Color: </label>
        <span className='inputWrapper' style={{'backgroundColor':meta.color}} >
          <input type='color' name='entityColor' value={meta.color} className='colorInput'/>
        </span>
      </span>
    </div>
  </span>

  return Menu({toggled, icon, klass: 'toNameAndColorMode',
     tooltip: 'set name & color of part', tooltipPos: 'bottom', content: subTools})
}

export function view (state$) {
  return state$.map(renderNameAndColorUi)
}
