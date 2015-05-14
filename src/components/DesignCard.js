import React from 'react'

import EditableItem from './EditableItem'
import {setDesignData$} from '../actions/designActions'


export default class DesignCard extends React.Component{
  constructor(props){
    super(props)
  }

  setDesignData(field, value){
    let data = {}
    data[field] = value
    setDesignData$(data)
  }

  render() {
    let design = this.props.design

    let authorsList = []
    design.authors.map(function(author){
      authorsList.push(
        <li>Name:{author.name} Email:{author.email} , Site:{author.url}</li>
      )
    })

    let tagsList = []
    design.tags.map(function(tag){
      tagsList.push( 
        <li> 
          <EditableItem data={tag}/> 
        </li> )
    })

    let licensesList = []
    design.licenses.map(function(license){
      licensesList.push(<li>{license}</li>)
    })

    let versionField = ""
    if(design.version) versionField = <span className="version"> v {design.version} </span>

    let persistentUrl = design._persistentUri//"http://jamapi.youmagine.com/api/v1/designs/bdesign"
    let persistent = (persistentUrl !== undefined)

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
            <EditableItem data={design.description} 
              changeCallback={ this.setDesignData.bind(this,"description") } /> 
          </div>
        </section>

        <section>
          <span>Authors:</span>
          <ul>
            {authorsList}
          </ul>
        </section>

        <section>
          <span>Tags:</span>
          <EditableItem data={"type here"} />
          <ul>
          {tagsList}
          </ul>
        </section>

        <section>
          <span>Licences:</span>
          <ul>
            {licensesList}
          </ul>
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