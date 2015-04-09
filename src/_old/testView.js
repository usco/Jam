import {CursorPropsMixin} from "react-kurtsore";
import immutable from 'immutable';
var k = require("kurtsore");

import React from 'react';


export const Album = React.createClass({
    mixins: [ CursorPropsMixin ],
    /*propTypes: {
        album: React.PropTypes.instanceOf(k.Cursor)
    },*/



    render(){
        let album = this.props.album.deref();
          return (<li>
            {album.get('artist')} - {album.get('title')} 
                <button type="button" onClick={this.props.handleClick}>Bla</button>
            </li>);
    }
});



export const Albums = React.createClass({
    mixins: [ CursorPropsMixin ],

    handleClick(){
      let bla =  [{
        title: "foo",
        artist: "bar"
      }];
      console.log( "sdf");
      this.props.albums.reset(immutable.fromJS(bla)); //deref()
    },


    render(){
        let albums = this.props.albums.deref(),
            cursors = albums.map((a, idx) => this.props.albums.derive(idx));

        return (
            <ul>
                {cursors.map(
                    (a, idx) => <Album key={idx} album={a} handleClick={this.handleClick} />
                )}
            </ul>
        );
    }
});