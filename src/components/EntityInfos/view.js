require('./style.css')
import Rx from 'rx'
const {just} = Rx.Observable
import { html } from 'snabbdom-jsx'

import { formatNumberTo, absSizeFromBBox, toDegree } from '../../utils/formatters'
import { isEmpty } from '../../utils/utils'
// //////
import ColorPicker from '../widgets/ColorPicker'
import assign from 'fast.js/object/assign' // faster object.assign

export function colorPickerWrapper (state$, DOM) {
  const props$ = just({color: '#FF00FF'})

  return ColorPicker({DOM, props$})
}

function absSizeInput (entity, controlsStep, numberPrecision, changeHandler) {
  /* display / control object transforms: posistion,rotation,scale etc
  in doubt about change handler
  onChange={self.handleChange.bind(self,'pos',index)}
  onChange={self.handleSizeChange.bind(self,index)}
  */

  // TODO : do the 'safing' of values better( no divisions by zero, nothing under 0 )
  /* var minScale = 0.0001
  if(!value) return minScale

  if(value <= 0) value = minScale
  //var foo = this.meshSize[axis]
  var map = {'l':'x','w':'y','h':'z'}
  var mapped = map[axis]
  var axisScale = this.selectedObject.scale[ mapped ]
  if( axisScale <= minScale ) axisScale = minScale

  var scaling = 1/ axisScale

  var meshSize = this.meshSize[axis]
  if(meshSize <= minScale) meshSize = minScale

  var originalSize = meshSize * scaling
  var targetScale = value/(originalSize)

  if(targetScale <= minScale) targetScale = minScale
  if(this.meshSize[axis] <= minScale) this.meshSize[axis] = minScale

  this.selectedObject.scale[mapped] = targetScale
  return targetScale

  absSize = originalSize * scale
  scale   =
  */

  if (entity && entity['sca']) {
    // this one is for absolute sizing
    function innerChangeHandler (fieldName, index, absSize, event) {
      let value = event.target.value
      let originalValue = absSize[index]
      let scaleChange = value / originalValue
      // console.log('changeHandler for absSize fieldName',fieldName,'index',index,'value',value,'originalValue',originalValue ,'absSize', absSize )
      console.log('value', value, 'originalValue', originalValue, scaleChange)

      changeHandler('sca', index, {target: {value: value}})
    }

    let absSizeInputs = []
    if (entity.bbox) {
      let absSize = absSizeFromBBox(entity.bbox)
      absSize = absSize || {w: 0, l: 0, h: 0}
      // convert to array to keep logic the same for all fields
      absSize = [absSize.l, absSize.w, absSize.h]
      // onChange={innerChangeHandler.bind(null,'absSize',index ,absSize)}

      absSize.forEach(function (entry, index) {
        entry = formatNumberTo(entry, numberPrecision)
        absSizeInputs.push(
          <input
            type='number'
            value={entry}
            step={controlsStep}
            onChange={changeHandler.bind(null, 'absSize', index)} />
        )
      })
    }

    return (
    <span><span>D:</span>
    {absSizeInputs}
    </span>
    )
  }
}

function nameInput (meta) {
  if (meta && 'name' in meta) {
    let name = meta.name
    if (isEmpty(name)) {
      name = undefined
    }
    return (
    <span className='inputWrapper'><input
                                     type='text'
                                     value={name}
                                     placeholder='Type name here...'
                                     className='nameInput'/></span>
    )
  }
}

function colorInput (meta) {
  if (meta && 'color' in meta) {
    return (
    <span><input type='color' value={meta.color} className='colorInput' /></span>
    )
  }
}

// TODO : this is a duplicate, refactor
const translateIconSvg = `<svg xmlns='http://www.w3.org/2000/svg' version='1.1'
  width='16' height='16' data-icon='move' viewBox='0 0 16 16' class='icon'>
  <path d='M8 0l-3 3h2v4h-4v-2l-3 3 3 3v-2h4v4h-2l2 2 1 1 1-1 2-2h-2v-4h4v2l3-3-3-3v2h-4v-4h2l-3-3z' />
</svg>`

const rotateIconSvg = `<svg version='1.1' id='CCW' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px'
  width='16' height='16' data-icon='rotate' viewBox='0 0 20 20' class='icon'>
  <path d='M0.685,10h2.372V9.795c0.108-4.434,3.724-7.996,8.169-7.996c4.515,0,8.174,3.672,8.174,8.201s-3.659,8.199-8.174,8.199
  c-1.898,0-3.645-0.65-5.033-1.738l1.406-1.504c1.016,0.748,2.27,1.193,3.627,1.193c3.386,0,6.131-2.754,6.131-6.15
  c0-3.396-2.745-6.15-6.131-6.15c-3.317,0-6.018,2.643-6.125,5.945V10h2.672l-3.494,3.894L0.685,10z'/>
</svg>`

const scaleIconSvg = `<svg
  width='16px' height='16px' viewBox='0 0 16 16' version='1.1' xmlns='http://www.w3.org/2000/svg' class='icon'>
    <!-- Generator: Sketch 3.4 (15575) - http://www.bohemiancoding.com/sketch -->
    <title>Untitled</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' sketch:type='MSPage'>
        <path d='M16,8 L13,5 L13,7 L9,7 L9,9 L13,9 L13,11 L16,8 L16,8 Z M3,11 L3,9 L7,9 L7,7 L3,7 L3,5 L0,8 L3,11 L3,11 Z M8,16 C8.553,16 9,15.951 9,15.4 L9,0.6 C9,0.047 8.553,0 8,0 C7.448,0 7,0.047 7,0.6 L7,15.4 C7,15.951 7.448,16 8,16 L8,16 Z' fill='#555555' sketch:type='MSShapeGroup'></path>
    </g>
</svg>`

function transformInputs (transforms, fieldName, displayName, controlsStep, numberPrecision) {
  let inputs = []
  let iconsPerTransform = {
    'pos': translateIconSvg,
    'rot': rotateIconSvg,
    'sca': scaleIconSvg
  }
  if (transforms && transforms[fieldName]) {
    transforms[fieldName]
      .slice(0, 3) // we only want x,y,z values, nothing else
      .forEach(function (value, index) {
        if (fieldName === 'rot') // convert rotation information to degree
        {
          value = toDegree(value)
        }
        value = formatNumberTo(value, numberPrecision)
        inputs.push(
          <input
            type='number'
            lang='en'
            value={value}
            step={controlsStep}
            className={`transformsInput`}
            attributes={{'data-transform': `${fieldName}_${index}` }}>
          </input>
        )
      })

    const iconSvg = iconsPerTransform[fieldName]
    return (
    <span className='transformInput'><span innerHTML={iconSvg}>{displayName}</span>
    {inputs}
    </span>
    )
  }
}

function getControlStep (transformType, settings) { // , snapping) {
  let {snapScaling, snapRotation} = settings // please replace this with actual settings

  const snapDefaults = {
    rot: 10, // snap rotation snaps to tens of degrees
    sca: 0.1 // snap scaling snaps to tens of percentages
  }

  const rotateStep = settings.snapRotation ? snapDefaults.rot : 0.5
  const scaleStep = settings.snapScaling ? snapDefaults.sca : 0.01

  switch (transformType) {
    case 'pos':
      return 0.1
    case 'rot':
      return rotateStep
      break
    case 'sca':
      return scaleStep
      break
    default:
      return 0.4
  }
}

export default function view (state$, colorPicker) {
  let numberPrecision = 2

  // {colorPicker}
  return state$.map(function (state) {
    let {meta, transforms, settings} = state

    if (!meta || !transforms || !settings) {
      return undefined
    }
    if (transforms.length > 0) transforms = transforms[0]
    if (meta.length > 0) meta = meta[0]

    // console.log('meta,transforms',meta,transforms)

    return ''

    const res = <div className='toolBarBottom entityInfos'>
             {colorInput(meta)}
             {nameInput(meta)}
             {transformInputs(transforms, 'pos', undefined, getControlStep('pos', settings), numberPrecision)}
             {transformInputs(transforms, 'rot', undefined, getControlStep('rot', settings), numberPrecision)}
             {transformInputs(transforms, 'sca', undefined, getControlStep('sca', settings), numberPrecision)}
           </div>
  })
}
