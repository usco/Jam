import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from "classnames"

import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import {formatNumberTo, absSizeFromBBox} from '../utils/formatters'


//onChange={this.handleColorChange.bind(this)}

/*creates markup to display / control object transforms: posistion,rotation,scale etc

 in doubt about change handler
 onChange={self.handleChange.bind(self,"pos",index)}
*/
function transformInputs(entity, fieldName, displayName, controlsStep, numberPrecision, changeHandler){
  let inputs = []
  if(entity && entity[fieldName]){

    entity[fieldName].forEach(function(entry, index){
      let entry = formatNumberTo(entry, numberPrecision)
      inputs.push(
        <input type="number" value={entry} step={controlsStep} onChange={changeHandler.bind(null,fieldName,index)}/>
      )
    })

    return (
      <span>
        <span> {displayName}: </span> {inputs}
      </span>
    )
  }
}

function colorInput(entity){
  if(entity && entity.color){
    return (
       <span>
        <input type="color" value={entity.color} /> 
      </span>
    )
  } 
}


function extraInput(entity, numberPrecision){
  //this is used only for annotations I guess?
  if(entity && entity.value){
    return(
      <span> value:{ formatNumberTo(entity.value, numberPrecision) }</span>
    )
  }
}

function debugItems(entity,debug){
  if(entity && debug){
    return (
      <div>
        <span> iuid: </span> <span>{entity.iuid}</span>
        <span> tuid: </span> <span>{entity.typeUid}</span>
      </div>
    )
  }     
}




function EntityInfos(interactions, props) {
  let settings$ = props.get('settings').filter(exists).startWith([])
  let entities$ = props.get('entities').filter(exists).startWith([])
    
  let numberPrecision = 2
  let controlsStep = 0.1

  let vtree$ = Rx.Observable
    .combineLatest(
      settings$,
      entities$,
      function(settings,entities){

        let element = null
        let entity = null

        if(entities.length>0) entity = entities[0]
        console.log("ENTITY",entity)

        function changeHandler(fieldName, index, event){
          let value = parseFloat(event.target.value)
          
          let transforms = entity[fieldName] //[0,0,0]
          transforms[index] = value
          console.log("reacting to change",fieldName, index, value, transforms)
          interactions.subject('selectionTransform').onEvent({iuids:[entity.iuid],transforms})
        }

        if(settings.mode !== "viewer")
        {
          element = (
            <div className="toolBarBottom">
              {colorInput(entity)}
              {transformInputs(entity, "pos", "P", controlsStep, numberPrecision, changeHandler)}
              {transformInputs(entity, "rot", "R", controlsStep, numberPrecision, changeHandler)}
              {transformInputs(entity, "sca", "S", controlsStep, numberPrecision, changeHandler)}
              {extraInput(entity,numberPrecision)}
            </div>
          )
        }

        return element
      })

  return {
    view: vtree$,
    events:{
    }
  }
}



EntityInfos = Cycle.component('EntityInfos',EntityInfos)
export default EntityInfos