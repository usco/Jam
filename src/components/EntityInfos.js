import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from 'classnames'

import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import {formatNumberTo, absSizeFromBBox} from '../utils/formatters'
import EditableItem from './EditableItem'

//onChange={this.handleColorChange.bind(this)}

/*creates markup to display / control object transforms: posistion,rotation,scale etc

 in doubt about change handler
 onChange={self.handleChange.bind(self,"pos",index)}


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
            <input type="number" 
            value={entry} 
            step={controlsStep}
            style={styles.numbers} onChange={self.handleSizeChange.bind(self,index)}/>
          )
        })

        absSizeInputs = (
          <span>
            <span>D:</span> {absSizeInputs}
          </span>
        )
      }

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
    
    let _changeHandler = changeHandler.bind(null,"comment",null)
    let valueEdit = null

    if( entity.hasOwnProperty("value") && entity.value ){
      valueEdit = (
        <span>
          Value: <EditableItem data={formatNumberTo(entity.value, numberPrecision)} placeholder="..." editable={false} />  
        </span>
      )
    }
      
    let comments = null
    if( entity.hasOwnProperty("comment") ){
      comments = (
        <span> 
          <EditableItem data={entity.comment} placeholder="add comment(s)..." id="comments" 
          changeHandler={_changeHandler}
          />  
        </span>
      )
    }

    return(
      <span>
        {valueEdit}
        {comments}
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


function commentsList (comments) {
  let listElements = comments.map(function(comment){
    return <li className="item"> 
        <header>
         <svg className="icon" version="1.1" id="Pencil" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
             viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
          <path fill="#FFFFFF" d="M14.69,2.661c-1.894-1.379-3.242-1.349-3.754-1.266c-0.144,0.023-0.265,0.106-0.35,0.223l-4.62,6.374
            l-2.263,3.123c-0.277,0.382-0.437,0.836-0.462,1.307l-0.296,5.624c-0.021,0.405,0.382,0.698,0.76,0.553l5.256-2.01
            c0.443-0.17,0.828-0.465,1.106-0.849l1.844-2.545l5.036-6.949c0.089-0.123,0.125-0.273,0.1-0.423
            C16.963,5.297,16.56,4.021,14.69,2.661z M8.977,15.465l-2.043,0.789c-0.08,0.031-0.169,0.006-0.221-0.062
            c-0.263-0.335-0.576-0.667-1.075-1.03c-0.499-0.362-0.911-0.558-1.31-0.706c-0.08-0.03-0.131-0.106-0.126-0.192l0.122-2.186
            l0.549-0.755c0,0,1.229-0.169,2.833,0.998c1.602,1.166,1.821,2.388,1.821,2.388L8.977,15.465z"/>
          </svg>

          <span className="author">{comment.author}</span> <span>commented 0.5h ago </span>
        </header>
        <div className="content">
          <EditableItem data={comment.text} editable={false}/>
        </div>
      </li>
  })
  console.log("listElements",listElements)
  return <ul className="commentsList">
    {listElements}
  </ul>

}

//FIXME : uppercased to avoid conflict with comments data
function Comments(comments, entity){
  /*let comments = [
    {text:"bla bla details",author:"foo"},
    {text:"oh yes cool ",author:"bar"},
  ]*/
  console.log("comments",comments)
  let newComment = {
    text:""
  }
  let commentDetails = null

  let commentsData = []
  if(comments) commentsData = comments.data

  if(entity){
    commentDetails = <div className="commentDetails">
      <span>
        { commentsList(commentsData) }

        <div className="item new">
          <header>
              <svg className="icon" version="1.1" id="Message" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                 viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
                <path fill="#FFFFFF" d="M18,6v7c0,1.1-0.9,2-2,2h-4v3l-4-3H4c-1.101,0-2-0.9-2-2V6c0-1.1,0.899-2,2-2h12C17.1,4,18,4.9,18,6z"/>
              </svg>
              Leave a comment
          </header>
          <div className="content">
            <EditableItem data={newComment.text}  placeholder="what are your thoughts..." multiline="true"/>
          </div>
          <button className="add">Add comment</button>
        </div>
        
      </span>
    </div>
  }

  return (
      <span>
        <a className="tooltips" href="#">
          <svg className="icon" version="1.1" id="Message" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
             viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
            <path fill="#FFFFFF" d="M18,6v7c0,1.1-0.9,2-2,2h-4v3l-4-3H4c-1.101,0-2-0.9-2-2V6c0-1.1,0.899-2,2-2h12C17.1,4,18,4.9,18,6z"/>
          </svg>
          <span>
            See/add comments
          </span>
        </a>
        {commentDetails}
      </span>

  )
}


function EntityInfos(interactions, props) {
  let settings$ = props.get('settings').filter(exists).startWith([])
  let entities$ = props.get('entities').filter(exists).startWith([])
  let comments$ = props.get('comments').filter(exists).startWith(undefined)

  let selectionTransforms$ = interactions.subject('selectionTransforms$')

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
          console.log("changeHandler",fieldName,index,event)
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
              {nameInput(entity,changeHandler)}
              {colorInput(entity, changeHandler)}
              {transformInputs(entity, "pos", "P", controlsStep, numberPrecision, changeHandler)}
              {transformInputs(entity, "rot", "R", controlsStep, numberPrecision, changeHandler)}
              {transformInputs(entity, "sca", "S", controlsStep, numberPrecision, changeHandler)}
              {extraInputs(entity,numberPrecision,changeHandler)}

              {Comments(comments,entity)}
            </div>
          )
        }

        return element
      })

  return {
    view: vtree$,
    events:{
      selectionTransforms$
    }
  }
}

EntityInfos = Cycle.component('EntityInfos',EntityInfos)
export default EntityInfos