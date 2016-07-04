/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import tooltipIconBtn from '../widgets/TooltipIconButton'

const mainIcon = `<svg width="22px" height="26px" viewBox="0 0 22 26" version="1.1" class="icon"
xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>mirror</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M21.47,23.5 L16.103,9.499 L18.787,2.5 L11.234,2.5 L11.234,0 L10.234,0 L10.234,2.5 L2.684,2.5 L5.367,9.499 L0,23.5 L10.234,23.5 L10.234,26 L11.234,26 L11.234,23.5 L21.47,23.5 L21.47,23.5 Z M1.454,22.5 L6.3,9.856 L6.437,9.499 L6.3,9.141 L4.138,3.5 L10.234,3.5 L10.234,22.5 L1.454,22.5 L1.454,22.5 Z" id="mirror" fill="#000000"></path>
    </g>
</svg>`

const mirrorXIcon = `<svg width="24px" height="28px" viewBox="0 0 24 28" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>mirror-x</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="mirror-x" fill="#000000">
            <polygon id="Shape" points="5.181 3.492 18.799 3.492 18.799 5.984 23.98 2.992 18.799 0 18.799 2.492 5.181 2.492 5.181 0 0 2.992 5.181 5.984"></polygon>
            <path d="M20.041,6.876 L12.016,6.876 L3.938,6.876 L6.622,13.875 L1.255,27.876 L12.016,27.876 L22.725,27.876 L17.359,13.875 L20.041,6.876 L20.041,6.876 Z M12.016,26.876 L2.709,26.876 L7.555,14.232 L7.692,13.875 L7.555,13.517 L5.393,7.876 L12.016,7.876 L12.016,26.876 L12.016,26.876 Z" id="Shape"></path>
        </g>
    </g>
</svg>`

const mirrorYIcon = `<svg width="24px" height="28px" viewBox="0 0 24 28" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>mirror-y</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="mirror-y" fill="#000000">
            <polygon id="Shape" points="18.8 3.492 5.182 3.492 5.182 5.984 0 2.992 5.182 0 5.182 2.492 18.8 2.492 18.8 0 23.98 2.992 18.8 5.984"></polygon>
            <path d="M6.366,13.999 L1,28 L11.709,28 L22.47,28 L17.103,13.999 L19.787,7 L11.71,7 L3.683,7 L6.366,13.999 Z M11.709,8 L18.332,8 L16.169,13.641 L16.031,13.999 L16.169,14.356 L21.016,27 L11.709,27 L11.709,8 L11.709,8 Z" id="Shape"></path>
        </g>
    </g>
</svg>`

const mirrorZIcon = `<svg width="29px" height="24px" viewBox="0 0 29 24" class='icon'
 version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>mirror-z</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="mirror-z" fill="#000000">
            <polygon id="Shape" points="25.641 5.181 28.133 5.181 25.141 0 22.148 5.181 24.641 5.181 24.641 18.8 22.148 18.8 25.141 23.98 28.133 18.8 25.641 18.8"></polygon>
            <path d="M16.604,8.439 L19.286,1.44 L3.184,1.44 L5.868,8.439 L4.358,12.376 L0.5,22.44 L21.969,22.44 L18.112,12.376 L16.604,8.439 L16.604,8.439 Z M5.43,12.376 L6.801,8.797 L6.938,8.44 L6.801,8.082 L4.639,2.44 L17.832,2.44 L15.67,8.082 L15.533,8.439 L15.67,8.796 L17.041,12.375 L5.43,12.375 L5.43,12.376 Z" id="Shape"></path>
        </g>
    </g>
</svg>`

export function renderMirroringUi (state) {
  const activeTool = state.settings.activeTool

  const mirrorModeToggled = activeTool === 'mirror'

  const subTools = <span>
    <button className='mirror-x' value='mirror-x'><span innerHTML={mirrorXIcon}/></button>
    <button className='mirror-y' value='mirror-y'><span innerHTML={mirrorYIcon}/></button>
    <button className='mirror-z' value='mirror-z'><span innerHTML={mirrorZIcon}/></button>
  </span>

  return tooltipIconBtn({toggled: mirrorModeToggled, icon: mainIcon, klass: 'toMirrorMode',
      tooltip: 'mirror', tooltipPos: 'bottom', content: subTools})
}

export function view (state$) {
  return state$.map(renderMirroringUi)
}
