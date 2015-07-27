import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from 'classnames'

import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import {formatNumberTo, absSizeFromBBox} from '../utils/formatters'
import EditableItem from './EditableItem'
import Comments from './Comments'


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
  return targetScale;*/


  if(entity && entity["sca"]){
    //this one is for absolute sizing
    let absSizeInputs = []
     if(entity.bbox){
      let absSize = absSizeFromBBox(entity.bbox)
      absSize = absSize || {w:0,l:0,h:0}
      //convert to array to keep logic the same for all fields
      absSize = [absSize.w,absSize.l,absSize.h]
      absSize.forEach(function(entry, index){
        let entry = formatNumberTo(entry, numberPrecision)
        absSizeInputs.push(
          <input type="number" value={entry} step={controlsStep}/>
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

function colorInput(entity, changeHandler){
  if(entity && entity.color){
    return (
       <span>
        <input type="color" value={entity.color} onChange={changeHandler.bind(null,"color",null)} /> 
      </span>
    )
  } 
}

function nameInput(entity,changeHandler){
  if(entity && entity.name){
    let _changeHandler = changeHandler.bind(null,"name",null)
    return <span> N:<EditableItem data={entity.name} id="name" changeHandler={_changeHandler}/> </span>
  }
}

function extraInputs(entity, numberPrecision, changeHandler){
  //this is used only for annotations I guess?
  //console.log("annotations",entity)
  if(entity){    
    let valueEdit = null

    if( entity.hasOwnProperty("value") && entity.value ){
      valueEdit = (
        <span>
          Value: <EditableItem data={formatNumberTo(entity.value, numberPrecision)} placeholder="..." editable={false} />  
        </span>
      )
    }
      
    return(
      <span>
        {valueEdit}
      </span>
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
  let comments$ = props.get('comments').filter(exists).startWith(undefined)

  let selectionTransforms$ = interactions.subject('selectionTransforms$')
  let addComment$          = interactions.get(".comments","addComment$").pluck("detail")

  comments$.subscribe(e=>console.log("Comments",e))

  //interactions.subject("valueChange$")
  //  .subscribe(data=>console.log("textChanges"))
  let numberPrecision = 2
  let controlsStep = 0.1

  let vtree$ = Rx.Observable
    .combineLatest(
      settings$
      ,entities$
      ,comments$

      ,function(settings, entities, comments){

        let element = null
        let entity = null

        if(entities.length>0) entity = entities[0]

        function changeHandler(fieldName, index, event){
          //console.log("changeHandler",fieldName,index,event)
          let transforms = entity[fieldName]
          let value = event.target.value

          if(fieldName!=="color" && fieldName !=="name" && fieldName !=="comment"){
            value = parseFloat(value)

            //FIXME : needed because of side efect of mutability ugh
            let transforms2 = Object.assign([],transforms)
            transforms2[index] = value
            console.log("reacting to change",fieldName, index, value, transforms, transforms2)
            transforms = transforms2
          }
          else{
            //dealing with color : this needs to be done better
            transforms = value
          }
         
          let output = {iuids:entity.iuid}
          output[fieldName] = transforms
          interactions.subject('selectionTransforms$').onEvent(output)
        }

        if(settings.mode !== "viewer")
        {
          element = (
            <div className="toolBarBottom entityInfos">
              <Comments className="comments" comments={comments} entity={entity} />
              {colorInput(entity, changeHandler)}
              {nameInput(entity,changeHandler)}       
              {transformInputs(entity, "pos", "P", controlsStep, numberPrecision, changeHandler)}
              {transformInputs(entity, "rot", "R", controlsStep, numberPrecision, changeHandler)}
              {transformInputs(entity, "sca", "S", controlsStep, numberPrecision, changeHandler)}
              {absSizeInput(entity,controlsStep,numberPrecision)}
              {extraInputs(entity,numberPrecision,changeHandler)}

              
            </div>
          )
        }

        return element
      })

  return {
    view: vtree$,
    events:{
      selectionTransforms$
      ,addComment$
    }
  }
}

EntityInfos = Cycle.component('EntityInfos',EntityInfos)
export default EntityInfos