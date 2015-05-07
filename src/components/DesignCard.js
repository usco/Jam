import React from 'react';

export default class DesignCard extends React.Component{
  constructor(props){
    super(props);
  }

  render() {
    let design = this.props.design;
    console.log("design",design);

    let authorsList = [];
    design.authors.map(function(author){
      authorsList.push(
        <li>Name:{author.name} Email:{author.email} , Site:{author.url}</li>
      );
    })

    let tagsList = [];
    design.tags.map(function(tag){
      tagsList.push( <li> {tag} </li> );
    })

    let licensesList = [];
    design.licenses.map(function(license){
      licensesList.push(<li>{license}</li>);
    })

    let versionField = "";
    if(design.version) versionField = <span className="version"> v {design.version} </span>;

    return(
      <div className="designCard" >
        <h1>
          {design.title} 
          { versionField }
        </h1>
        <section>
          <span>
            Description:
          </span>
          <div>
            {design.description}
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
      </div>
    )
  }
}