/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest

import {formatNumberTo, absSizeFromBBox} from '../../../utils/formatters'

function absSizeInput(entity , controlsStep, numberPrecision, changeHandler){
  /*display / control object transforms: posistion,rotation,scale etc
  in doubt about change handler
  onChange={self.handleChange.bind(self,"pos",index)}
  onChange={self.handleSizeChange.bind(self,index)}
  */

  //TODO : do the "safing" of values better( no divisions by zero, nothing under 0 )
  /*var minScale = 0.0001;
  if(!value) return minScale;
  
  if(value <= 0) value = minScale;
  //var foo = this.meshSize[axis];
  var map = {"l":"x","w":"y","h":"z"};
  var mapped = map[axis];
  var axisScale = this.selectedObject.scale[ mapped ];
  if( axisScale <= minScale ) axisScale = minScale;
  
  var scaling = 1/ axisScale;
  
  var meshSize = this.meshSize[axis];
  if(meshSize <= minScale) meshSize = minScale;
  
  var originalSize = meshSize * scaling;
  var targetScale = value/(originalSize);
    
  if(targetScale <= minScale) targetScale = minScale;
  if(this.meshSize[axis] <= minScale) this.meshSize[axis] = minScale;
  
  this.selectedObject.scale[mapped] = targetScale;
  return targetScale;


  absSize = originalSize * scale
  scale   =
  */


  if(entity && entity["sca"]){
    //this one is for absolute sizing

    function innerChangeHandler(fieldName, index, absSize, event){  
      let value = event.target.value
      let originalValue = absSize[index]
      let scaleChange = value/originalValue
      //console.log("changeHandler for absSize fieldName",fieldName,"index",index,"value",value,"originalValue",originalValue ,"absSize", absSize )
      console.log("value",value, "originalValue",originalValue,scaleChange)

      changeHandler("sca",index,{target:{value:value}})
    }

    let absSizeInputs = []
     if(entity.bbox){
      let absSize = absSizeFromBBox(entity.bbox)
      absSize = absSize || {w:0,l:0,h:0}
      //convert to array to keep logic the same for all fields
      absSize = [absSize.l,absSize.w,absSize.h]
      //onChange={innerChangeHandler.bind(null,"absSize",index ,absSize)} 

      absSize.forEach(function(entry, index){
        entry = formatNumberTo(entry, numberPrecision)
        absSizeInputs.push(
          <input type="number" value={entry} step={controlsStep} 
          onChange={changeHandler.bind(null,"absSize",index)} />
        )
      })
    }

    return (
      <span>
        <span>D:</span> {absSizeInputs}
      </span>
    )

  }
}


function nameInput(core){
   if(core && core.name){
    return (
      <span>
        <input type="text" value={core.name} className="nameInput"/> 
      </span>
    )
  } 
}

function colorInput(core){
  if(core && core.color){
    return (
      <span>
        <input type="color" value={core.color} className="colorInput" /> 
      </span>
    )
  } 
}

function transformInputs(transforms, fieldName, displayName, controlsStep, numberPrecision){
  let inputs = []
  if(transforms && transforms[fieldName]){

    transforms[fieldName].forEach(function(entry, index){
      entry = formatNumberTo(entry, numberPrecision)
      entry = entry.slice(0,3) //we only want x,y,z values, nothing else
      inputs.push(
        <input type="number" value={entry} step={controlsStep} className={`transformsInput`}
          attributes={ {'data-transform': `${fieldName}_${index}` } }>
        </input>
      )
    })

    return (
      <span>
        <span> {displayName}: </span> {inputs}
      </span>
    )
  }
}

export default function view(state$){
  let numberPrecision = 2
  let controlsStep = 0.1

  return state$.map(function(state){
      let {core,transforms} = state

      if(!core || !transforms){
        return undefined
      }
      if(transforms.length>0) transforms = transforms[0]
      if(core.length>0) core = core[0]
      
      //console.log("core,transforms",core,transforms)

      return <div className="toolBarBottom entityInfos">
        {nameInput(core)}
        {colorInput(core)}
        {transformInputs(transforms, "pos", "P", controlsStep, numberPrecision)}
        {transformInputs(transforms, "rot", "R", controlsStep, numberPrecision)}
        {transformInputs(transforms, "sca", "S", controlsStep, numberPrecision)}
      </div>   
    })
}