import {html} from 'snabbdom-jsx'
import Menu from '../widgets/Menu'

const mainIcon = `<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 23 23" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>measurement</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="measurement" fill="#000000">
            <path d="M11.1133613,8 L11.888882,10.0680673 L11.9495491,10.2314239 L12.1263937,10.7018724 L12.6817388,12.1825666 L12.7717347,12.4218739 L12.9041108,12.7738739 L12.7717347,13.1258739 L12.6817388,13.3651812 L12.682047,13.3643607 L9.06802444,23 L8.69295617,23 L8.24335199,22.3511795 L8.37506827,22 L22.0204453,22 L22.151991,22.350967 L21.7021307,23 L21.3273212,23 L19.1118218,17.0889975 L18.8728898,16.4534372 L17.7141977,13.3631359 L17.6242018,13.1238286 L17.4918257,12.7718286 L17.6242018,12.4198286 L17.7138508,12.1814451 L18.2694018,10.699752 L18.3577376,10.4653235 L18.5080638,10.065362 L19.2819918,8 L19.6567096,8 L20.1066608,8.64910822 L19.9751754,9 L10.4203616,9 L10.2886903,8.64887656 L10.738362,8 L11.1133613,8 L11.1133613,8 Z M11.7457388,13.0131812 L11.8357347,12.7738739 L11.7457388,12.5345666 L11.1900823,11.053043 L11.0134994,10.5832917 L10.9514568,10.4162538 L10.0453616,8 L20.3498932,8 L19.4444798,10.4162538 L19.2938048,10.8171447 L19.2051725,11.0523613 L18.6501977,12.5325212 L18.5602018,12.7718286 L18.6501977,13.0111359 L19.8092359,16.102359 L20.0478615,16.7371029 L22.3952548,23 L8,23 L11.7457388,13.0131812 L11.7457388,13.0131812 Z" id="Path"></path>
            <path d="M0.5,5 L4.5,5 L4,4.5 L4,22.5 L4.5,22 L0.5,22 L1,22.5 L1,4.5 L0.5,5 L0.5,5 Z M0.5,4 L0,4 L0,4.5 L0,22.5 L0,23 L0.5,23 L4.5,23 L5,23 L5,22.5 L5,4.5 L5,4 L4.5,4 L0.5,4 L0.5,4 Z" id="Rectangle-path"></path>
            <path d="M4.5,1 L22.5,1 L22,0.5 L22,4.5 L22.5,4 L4.5,4 L5,4.5 L5,0.5 L4.5,1 L4.5,1 Z M4.5,0 L4,0 L4,0.5 L4,4.5 L4,5 L4.5,5 L22.5,5 L23,5 L23,4.5 L23,0.5 L23,0 L22.5,0 L4.5,0 L4.5,0 Z" id="Rectangle-path"></path>
            <path d="M0.5,1 L4.5,1 L4,0.5 L4,4.5 L4.5,4 L0.5,4 L1,4.5 L1,0.5 L0.5,1 L0.5,1 Z M0.5,0 L0,0 L0,0.5 L0,4.5 L0,5 L0.5,5 L4.5,5 L5,5 L5,4.5 L5,0.5 L5,0 L4.5,0 L0.5,0 L0.5,0 Z" id="Rectangle-path"></path>
            <polygon id="Shape" points="8 4.5 8 2.5 7 2.5 7 4.5"></polygon>
            <polygon id="Shape" points="12 4.5 12 2.5 11 2.5 11 4.5"></polygon>
            <polygon id="Shape" points="16 4.5 16 2.5 15 2.5 15 4.5"></polygon>
            <polygon id="Shape" points="20 4.5 20 2.5 19 2.5 19 4.5"></polygon>
            <polygon id="Shape" points="4.5 19 2.5 19 2.5 20 4.5 20"></polygon>
            <polygon id="Shape" points="4.5 15 2.5 15 2.5 16 4.5 16"></polygon>
            <polygon id="Shape" points="4.5 11 2.5 11 2.5 12 4.5 12"></polygon>
            <polygon id="Shape" points="4.5 7 2.5 7 2.5 8 4.5 8"></polygon>
        </g>
    </g>
</svg>`


const addNoteIcon = `<svg version="1.1" id="Flag" xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMidYMid meet" x="0px" y="0px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="icon">
<path d="M18.926,5.584c-9.339,13.568-6.142-0.26-14.037,6.357L6.684,19H4.665L1,4.59l1.85-0.664
  c8.849-6.471,4.228,5.82,15.637,1.254C18.851,5.033,19.142,5.27,18.926,5.584z"/>
</svg>`

const measureDistanceIcon = `<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>ruler</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M23.85325,5.641 L18.35325,0.141 C18.16525,-0.047 17.83325,-0.047 17.64625,0.141 L0.14625,17.641 C-0.04875,17.836 -0.04875,18.153 0.14625,18.348 L5.64625,23.848 C5.73925,23.942 5.86625,23.995 5.99925,23.995 C6.13225,23.995 6.25925,23.942 6.35325,23.849 L23.85325,6.349 C24.04825,6.153 24.04825,5.836 23.85325,5.641 L23.85325,5.641 Z M5.99925,22.788 L1.20625,17.994 L4.01425,15.186 L6.16025,17.333 C6.25825,17.431 6.38625,17.479 6.51425,17.479 C6.64225,17.479 6.77025,17.43 6.86825,17.333 C7.06325,17.138 7.06325,16.821 6.86825,16.626 L4.72225,14.479 L6.01725,13.184 L7.67925,14.821 C7.77625,14.917 7.90325,14.965 8.03025,14.965 C8.15925,14.965 8.28825,14.915 8.38625,14.816 C8.57925,14.62 8.57725,14.303 8.38025,14.109 L6.72425,12.478 L8.25725,10.945 L10.40325,13.091 C10.50125,13.189 10.62925,13.237 10.75725,13.237 C10.88525,13.237 11.01325,13.188 11.11125,13.091 C11.30625,12.896 11.30625,12.579 11.11125,12.384 L8.96525,10.238 L10.26525,8.938 L11.66225,10.335 C11.76025,10.433 11.88825,10.481 12.01625,10.481 C12.14425,10.481 12.27225,10.432 12.37025,10.335 C12.56525,10.14 12.56525,9.823 12.37025,9.628 L10.97325,8.231 L12.49925,6.702 L14.64525,8.848 C14.74325,8.946 14.87125,8.994 14.99925,8.994 C15.12725,8.994 15.25525,8.945 15.35325,8.848 C15.54825,8.653 15.54825,8.336 15.35325,8.141 L13.20625,5.994 L14.50125,4.698 L16.16225,6.336 C16.26025,6.432 16.38625,6.48 16.51325,6.48 C16.64225,6.48 16.77125,6.43 16.86925,6.331 C17.06325,6.134 17.06125,5.818 16.86425,5.624 L15.20825,3.991 L17.99925,1.201 L22.79225,5.994 L5.99925,22.788 L5.99925,22.788 Z" id="ruler" fill="#000000"></path>
    </g>
</svg>`

const measureThicknessIcon = `<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 25 25" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>thickness</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M21,8.3492424 L21,17.3492424 L15,12.8492424 L21,8.3492424 Z M29,12.3492424 L21,12.3492424 L21,13.3492424 L29,13.3492424 L29,12.3492424 Z M4,8.3492424 L4,17.3492424 L10,12.8492424 L4,8.3492424 Z M-4,12.3492424 L4,12.3492424 L4,13.3492424 L-4,13.3492424 L-4,12.3492424 Z M11.6507576,0 L12.6507576,0 L12.6507576,26 L11.6507576,26 L11.6507576,0 Z" id="thickness" fill="#000000" transform="translate(12.500000, 13.000000) rotate(-45.000000) translate(-12.500000, -13.000000) "></path>
    </g>
</svg>`

const measureDiameterIcon = `<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 22 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>diameter</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="diameter" fill="#000000">
            <path d="M11,22.5 C16.7989899,22.5 21.5,17.7989899 21.5,12 C21.5,6.20101013 16.7989899,1.5 11,1.5 C5.20101013,1.5 0.5,6.20101013 0.5,12 C0.5,17.7989899 5.20101013,22.5 11,22.5 M11,21.5 C5.75329488,21.5 1.5,17.2467051 1.5,12 C1.5,6.75329488 5.75329488,2.5 11,2.5 C16.2467051,2.5 20.5,6.75329488 20.5,12 C20.5,17.2467051 16.2467051,21.5 11,21.5" id="Oval-58"></path>
            <rect id="Rectangle-402" transform="translate(11.000000, 11.500000) rotate(-45.000000) translate(-11.000000, -11.500000) " x="-4" y="11" width="30" height="1"></rect>
        </g>
    </g>
</svg>`

const measureAngleIcon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"viewBox="0 0 18 18" class="icon">
    <title>Untitled</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <polygon id="Triangle-1" stroke="#000000" stroke-width="3" sketch:type="MSShapeGroup" points="0 0 18 18 0 18 "></polygon>
    </g>
</svg>`

/*<section>
    {Menu({toggled: activeTool === 'addNote', icon: addNoteIconSvg, klass: 'addNote',
      tooltip: 'add note', tooltipPos: 'bottom'})}

    {Menu({toggled: activeTool === 'measureDistance', icon: measureDistanceIconSvg, klass: 'measureDistance',
      tooltip: 'measure distance', tooltipPos: 'bottom'})}

    {Menu({toggled: activeTool === 'measureThickness', icon: measureThicknessIconSvg, klass: 'measureThickness',
      tooltip: 'measure thickness', tooltipPos: 'bottom'})}

    {Menu({toggled: activeTool === 'measureDiameter', icon: measureDiameterIconSvg, klass: 'measureDiameter',
      tooltip: 'measure diameter', tooltipPos: 'bottom'})}

    {Menu({toggled: activeTool === 'measureAngle', icon: measureAngleIconSvg, klass: 'measureAngle',
      tooltip: 'measure angle', tooltipPos: 'bottom'})}*/

export function renderMeasurementsUi (state) {
  const activeTool = state.settings.activeTool
  const toggled = activeTool === 'measure'

  /*{Menu({toggled: activeTool === 'addNote', icon: addNoteIconSvg, klass: 'addNote',
  tooltip: 'add note', tooltipPos: 'bottom'})}*/
  const subTools = <span>
    {Menu({toggled: activeTool === 'measureDistance', icon: measureDistanceIcon, klass: 'measureDistance',
      tooltip: 'measure distance', tooltipPos: 'bottom'})}

    {Menu({toggled: activeTool === 'measureThickness', icon: measureThicknessIcon, klass: 'measureThickness',
      tooltip: 'measure thickness', tooltipPos: 'bottom'})}

    {Menu({toggled: activeTool === 'measureDiameter', icon: measureDiameterIcon, klass: 'measureDiameter',
      tooltip: 'measure diameter', tooltipPos: 'bottom'})}

    {Menu({toggled: activeTool === 'measureAngle', icon: measureAngleIcon, klass: 'measureAngle',
      tooltip: 'measure angle', tooltipPos: 'bottom'})}
  </span>

  return Menu({toggled, icon: mainIcon, klass: 'toMeasureMode',
      tooltip: 'measure & annotate', tooltipPos: 'bottom', content: subTools, subItems: true})
}

export function view (state$) {
  return state$.map(renderMeasurementsUi)
}
