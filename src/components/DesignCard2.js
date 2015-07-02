import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from 'classnames'

import {trim} from '../utils/utils'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import EditableItem from './EditableItem2'


function addTag(value, tags){
  //input = input.innerText
    
  //Rx.Observable.fromEvent  
  //let input = this.state.currentTagInput
  input = [input]
  input
    .filter(x=>x!=="")
    .map(function(data){ return data.replace(/^\s+|\s+$/g, '') })
    .map(x=>x.split(","))
    .map(function(data){
      tags = tags.concat( data )
      //updateDesign$({tags:tags})
      //self.setState({currentTagInput:""})
    })
}

function removeTag(tag, tags){
  let idx = tags.indexOf(tag)
  if(idx>-1){ 
    let tags = Object.assign([],tags)
    tags.splice(idx,1)
    //updateDesign$({tags:tags})
  }
}

function addLicense(license, licenses){
  let selectedLicense = license//input.options[input.selectedIndex].value

  let licenses = Object.assign([], licenses)
  if(licenses.indexOf(selectedLicense)===-1){
    licenses.push(selectedLicense)
    //updateDesign$({licenses:licenses})
  }

  //let selectedLicense = selectedLicense
}

function removeLicense(license, licenses){
  console.log("remove license")
  let idx = licenses.indexOf(license)
  if(idx>-1){ 
    let licenses = Object.assign([],licenses)
    licenses.splice(idx,1)
    //updateDesign$({licenses:licenses})
  }
}

function addAuthor(authors){
  let name = React.findDOMNode(this.refs.nAuthorName).value
  let email= React.findDOMNode(this.refs.nAuthorEmail).value
  let url  = React.findDOMNode(this.refs.nAuthorUrl).value
  console.log(email,url,name)
  
  let authors = Object.assign([], authors)
  authors.push({
    name:name,
    email:email,
    url:url
  })
  //updateDesign$({authors:authors})
}

function removeAuthor(author, authors){
  let authors = Object.assign([], authors)

  authors = authors.filter(function(authorsEntry){
    return !(
      authorsEntry.name === author.name && 
      authorsEntry.url  === author.url && 
      authorsEntry.email=== author.email)
  })

  //updateDesign$({authors:authors})
}




function DesignCard(props,interactions){



  function view(){

    return <div> </div>

  }


  return Rx.Observable.just("").map(view)

}



let DesignCard = Cycle.component('DesignCard',DesignCard)
export default DesignCard