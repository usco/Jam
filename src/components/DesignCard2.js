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



function authors(authors, editable){
  let authorsList = []
    authors.map(function(author){
      let item = null
      if(editable){
        item = <button onClick={self.removeAuthor.bind(self,author)}>X</button>
      }
      authorsList.push(
        <li>
          <span> Name:{author.name} Email:{author.email} , Site:{author.url}</span>
          {item}
        </li>
      )
    })
    authorsList = <ul>{authorsList}</ul>

    let authorsEditor = null

    if(editable){
      authorsEditor = (
        <div>
          <span>
            Name<input type="text" ref="nAuthorName"></input>
            Email<input type="text" ref="nAuthorEmail"></input>
            Url<input type="text" ref="nAuthorUrl"></input>
            <button onClick={this.addAuthor.bind(this)}> Add </button>
          </span>
        </div>
      )
    }
}

function tags(tags, editable){
   /////////TAGS
    let tagsList = []
    tags.map(function(tag){
      let item = null
      if(editable){ 
        item = <button onClick={self.removeTag.bind(self,tag)}>X</button>
      }
      tagsList.push( 
        <li> 
          {tag}
          {item}
        </li> )
    })
    tagsList = <ul>{tagsList}</ul>

    //tags editor
    let tagsEditor = null

    if(editable){
      tagsEditor = (
        <div>
          <div> Put a comma between each one </div>
          <EditableItem 
            placeholder={"...type here"} 
            data={this.state.currentTagInput} 
            ref="tagInput"/>
          <button onClick={this.addTag.bind(this)}>ok</button>
        </div>
      )
    }
}

function licenses(licenses,editable){
  ///////
  let licensesList = []
  licenses.map(function(license){
    let item = null
    if(editable){ 
      item = <button onClick={self.removeLicense.bind(self,license)}>X</button>
    }
    licensesList.push(
      <li>
        {license}
        {item}
      </li>)
  })
  licensesList = <ul>{licensesList}</ul>
  //////


  let licensesEditor = null

  if(editable){
    let availableLicenses = ["MIT","GPLV3"]
    let availableLicensesD  = []
    availableLicenses.map(function(license){
      availableLicensesD.push(<option>{license}</option>)
    })

    licensesEditor = (
      <div>
        <select ref="licenseInput">
          {availableLicensesD}
        </select>
        <button onClick={this.addLicense.bind(this)} > Add</button>
      </div>
    )
  }
}


function DesignCard(props,interactions){

  function view(){
    return <div> 
      <h1>
          {design.name} 
          { versionField }
        </h1>
        <section>
          <span>
            Description:
          </span>
          <div>
            <EditableItem 
              editable={editable}
              multiline={true} 
              data={design.description} 
              changeCallback={ this.setDesignData.bind(this,"description") } /> 
          </div>
        </section>

        <section>
          <span>Authors:</span>
          {authorsList}
          {authorsEditor}
        </section>

        <section>
          <span>Tags:</span>
          {tagsEditor}
          {tagsList}
        </section>

        <section>
          <span>Licences:</span>
          {licensesEditor}
          {licensesList}
        </section>

        <section>
          <div>
          Persistent design <input type="checkbox" disabled={true} checked={persistent}></input>
          </div>
          <div>
          Url : {persistentUrl}
          </div>
        </section>

    </div>
  }


  return Rx.Observable.just("").map(view)

}



let DesignCard = Cycle.component('DesignCard',DesignCard)
export default DesignCard