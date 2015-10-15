/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import Class from 'classnames'
let merge = Rx.Observable.merge
let just  = Rx.Observable.just

import {preventDefault,isTextNotEmpty,formatData,exists} from '../../../utils/obsUtils'
//import EditableItem from './EditableItem'

function renderCommentsList (comments) {
  const iconSvg = `<svg class="icon" version="1.1" id="Pencil" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
     viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
    <path fill="#FFFFFF" d="M14.69,2.661c-1.894-1.379-3.242-1.349-3.754-1.266c-0.144,0.023-0.265,0.106-0.35,0.223l-4.62,6.374
      l-2.263,3.123c-0.277,0.382-0.437,0.836-0.462,1.307l-0.296,5.624c-0.021,0.405,0.382,0.698,0.76,0.553l5.256-2.01
      c0.443-0.17,0.828-0.465,1.106-0.849l1.844-2.545l5.036-6.949c0.089-0.123,0.125-0.273,0.1-0.423
      C16.963,5.297,16.56,4.021,14.69,2.661z M8.977,15.465l-2.043,0.789c-0.08,0.031-0.169,0.006-0.221-0.062
      c-0.263-0.335-0.576-0.667-1.075-1.03c-0.499-0.362-0.911-0.558-1.31-0.706c-0.08-0.03-0.131-0.106-0.126-0.192l0.122-2.186
      l0.549-0.755c0,0,1.229-0.169,2.833,0.998c1.602,1.166,1.821,2.388,1.821,2.388L8.977,15.465z"/>
    </svg>`

  let listElements = comments.map(function(comment){
    return <li className="item" > 
        <header>
          <span innerHTML={iconSvg}> </span>
          <span className="author">{comment.author}</span> <span>commented 0.5h ago </span>
        </header>
        <div className="content">
            {comment.text}
        </div>
      </li>
  })
  return <ul className="commentsList">
    {listElements}
  </ul>
}

/*<EditableItem id="newComment" 
          data={newComment.text}  
          placeholder="what are your thoughts..." 
          multiline="true"
          changeHandler={changeHandler}
        />*/


function renderCommentCreator (){
  const iconSvg = `
    <svg class="icon" version="1.1" id="Message" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
       viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
      <path fill="#FFFFFF" d="M18,6v7c0,1.1-0.9,2-2,2h-4v3l-4-3H4c-1.101,0-2-0.9-2-2V6c0-1.1,0.899-2,2-2h12C17.1,4,18,4.9,18,6z"/>
    </svg>`

  return  (
    <div className="item new">
      <header innerHTML={iconSvg}>
          Leave a comment
      </header>
      <div className="content">
        
      </div>
      <button className="add">Add comment</button>
    </div>
  )
}

 /*<a className="tooltips" href="#" >
          <span innerHTML={iconSvg}> </span>
          <span>
            See/add comments
          </span>
        </a>*/

function renderComments(toggled, comments, entity){
  let commentDetails = null
  let commentsList = []

  let key = [undefined,undefined] //at design level ie :no entity selected
  if(entity){
    key = [entity.id,entity.typeUid]
  }
  
  if(toggled){
    commentsList = comments.bykey[key]
    if(!commentsList){
      commentsList = []
    }
    console.log("commentsList",commentsList,key)

    //
    commentDetails = <div className="commentDetails fadesIn visible">
      <span>
        { renderCommentsList(commentsList) }
        { renderCommentCreator() }
      </span>
    </div>
  }

  const iconSvg =  `
    <svg class="icon" version="1.1" id="Message" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
       viewBox="0 0 20 20" enable-background="new 0 0 20 20" >
      <path fill="#FFFFFF" d="M18,6v7c0,1.1-0.9,2-2,2h-4v3l-4-3H4c-1.101,0-2-0.9-2-2V6c0-1.1,0.899-2,2-2h12C17.1,4,18,4.9,18,6z"/>
    </svg>`
  
  return (
    <span className="comments" innerHTML={iconSvg}>
       {commentDetails}
    </span>
  )
}

export default function view(state$){
   /*let vtree$ = Rx.Observable
    .combineLatest(
      comments$
      ,entity$
      ,newComment$
      ,toggled$
      ,function(comments,entity,newComment, toggled){

        return renderComments(toggled, comments, entity, newComment)
      }
    )*/

  let fakeComments = {
    bykey:{}
  }

  fakeComments.bykey[[undefined,undefined]] = [
  {
    text: "foo bar baz"
    ,author:"DR WhoBrown"}
    , 
    {
    text: "indeed"
    ,author:"Roborbarbar"}
  ]

  return just( renderComments(false,fakeComments,undefined) )
}
