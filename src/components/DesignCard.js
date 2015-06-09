import React from 'react'
//import Rx from 'rx'

import EditableItem from './EditableItem'
import {setDesignData$} from '../actions/designActions'


export default class DesignCard extends React.Component{
  constructor(props){
    super(props)
    this.state={
      currentTagInput:"",
      selectedLicense:undefined
    }
  }

  setDesignData(field, value){
    let data = {}
    data[field] = value
    setDesignData$(data)
  }

  addTag(value){
    let self = this
    let input = React.findDOMNode(this.refs.tagInput)
    input = input.innerText
    
    //Rx.Observable.fromEvent  
    //let input = this.state.currentTagInput
    input = [input]
    input
      .filter(x=>x!=="")
      .map(function(data){ return data.replace(/^\s+|\s+$/g, '') })
      .map(x=>x.split(","))
      .map(function(data){
        let tags = self.props.design.tags
        tags = tags.concat( data )
        setDesignData$({tags:tags})
        self.setState({currentTagInput:""})
      })
  }

  removeTag(tag){
    let idx = this.props.design.tags.indexOf(tag)
    if(idx>-1){ 
      let tags = Object.assign([],this.props.design.tags)
      tags.splice(idx,1)
      setDesignData$({tags:tags})
    }
  }

  addLicense(){
    let self = this
    let input = React.findDOMNode(this.refs.licenseInput)
    let selectedLicense = input.options[input.selectedIndex].value
    //console.log("add license",input, input.selectedIndex, input.options[input.selectedIndex].value)

    let licenses = Object.assign([], this.props.design.licenses)
    if(licenses.indexOf(selectedLicense)===-1){
      licenses.push(selectedLicense)
      setDesignData$({licenses:licenses})
    }

    //let selectedLicense = selectedLicense
  }

  removeLicense(license){
    console.log("remove license")
    let idx = this.props.design.licenses.indexOf(license)
    if(idx>-1){ 
      let licenses = Object.assign([],this.props.design.licenses)
      licenses.splice(idx,1)
      setDesignData$({licenses:licenses})
    }
  }

  addAuthor(){
    let name = React.findDOMNode(this.refs.nAuthorName).value
    let email= React.findDOMNode(this.refs.nAuthorEmail).value
    let url  = React.findDOMNode(this.refs.nAuthorUrl).value
    console.log(email,url,name)
    
    let authors = Object.assign([], this.props.design.authors)
    authors.push({
      name:name,
      email:email,
      url:url
    })
    setDesignData$({authors:authors})
  }

  removeAuthor(author){
    let authors = Object.assign([], this.props.design.authors)

    authors = authors.filter(function(authorsEntry){
      return !(
        authorsEntry.name === author.name && 
        authorsEntry.url  === author.url && 
        authorsEntry.email=== author.email)
    })

    setDesignData$({authors:authors})
  }

  render() {
    let self     = this
    let design   = this.props.design

    let persistentUrl = design.uri
    let persistent    = (persistentUrl !== undefined)
    let editable      = design.editable || true 

    ///
    let authorsList = []
    design.authors.map(function(author){
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

    /////////TAGS
    let tagsList = []
    design.tags.map(function(tag){
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

    ///////
    let licensesList = []
    design.licenses.map(function(license){
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

    //versioning
    let versionField = ""
    if(design.version) versionField = <span className="version"> v {design.version} </span>

    console.log("design", design)

    return(
      <div className="designCard" >
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
    )
  }
}