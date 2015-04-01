import React from 'react';
//import LoginWrapper from './fynxTest/Login.react.js';
import ThreeJs from './webgl/three-js.react.js';
//import * from "babel-core/polyfill"
require("babel-core/polyfill");


export default class App extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      test: 42,
      cube:{ 
        rot:{
          x:0,
          y:0,
          z:0}
      } 
    };
    
  }
  
  _changerTest(){
      this.setState( 
      {
        test: this.state.test +1,
        cube:{ 
          rot:{
            x:0,
            y:0,
            z:this.state.cube.rot.z +0.01
          }
        } 
       }
      );
    
    //requestAnimationFrame( this._changerTest.bind(this) );
  }
  
  componentDidMount(){
     this.setState( {test: 42} );
     this._changerTest();  
     // <LoginWrapper/>
  }
  
  
  render() {
    return (
        <ThreeJs testProp={this.state.test} cubeRot={this.state.cube}/>
    );
  }
}
