import React from 'react';
import co from 'co';

import ThreeJs from './webgl/three-js.react.js';
import postProcessMesh from './meshpp/postProcessMesh'

import AssetManager from 'usco-assetmanager'
import DesktopStore from 'usco-desktop-store'
import XhrStore     from 'usco-xhr-store'
import StlParser    from 'usco-stl-parser'

import DndBehaviour           from './behaviours/dndBe'


export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      pkg:undefined,
    };
    
    console.log("assetManager",AssetManager)
    this.assetManager = new AssetManager();
    this.assetManager.addParser("stl", new StlParser());

    this.assetManager.addStore( "desktop", new DesktopStore() );
    this.assetManager.addStore( "xhr"    , new XhrStore() );
  }
  
  _changerTest(){
          this.state = {
      test: 42,
      cube:{ 
        rot:{
          x:0,
          y:0,
          z:0}
      } 
    };

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

    var pjson = require('json!../package.json');
    console.log(pjson.version);
    this.setState({pkg:pjson});


    //add drag & drop behaviour 
    let container = this.refs.wrapper.getDOMNode();
    DndBehaviour.attach( container );
    DndBehaviour.dropHandler = this.handleDrop.bind(this);
  }

  componentWillUnmount(){
    DndBehaviour.detach( );
  }

  handleDrop(data){
    console.log("something dropped on me", data)
    for (var i = 0, f; f = data.data[i]; i++) {
        this.loadMesh( f, {display: true} );
    }
  }

  loadMesh( uriOrData, options ){
    const DEFAULTS={
    }
    var options     = options || {};
    var display     = options.display === undefined ? true: options.display;
    var addToAssembly= options.addToAssembly === undefined ? true: options.addToAssembly;
    var keepRawData = options.keepRawData === undefined ? true: options.keepRawData;
    
    if(!uriOrData){ console.warn("no uri or data to load"); return};
    var self = this;
    var resource = this.assetManager.load( uriOrData, {keepRawData:true, parsing:{useWorker:false,useBuffers:true} } );
    
    co(function* (){

      try{
        let meshData = yield resource.deferred.promise;
        let shape = postProcessMesh( resource )

        self.refs.glview.scene.add( shape );

        return;
        //part type registration etc
        //we are registering a yet-uknown Part's type, getting back an instance of that type
        var partKlass = self._kernel.registerPartType( null, null, shape, {name:resource.name, resource:resource} );
        if( addToAssembly ) {
          var part = self._kernel.makePartTypeInstance( partKlass );
          self._kernel.registerPartInstance( part );
        }
        
        if( display || addToAssembly ){
          self._meshInjectPostProcess( shape );
          //self.selectedEntities = [ shape.userData.entity ];
        }
      }catch( error ){
        console.log("failed to load resource", error, resource.error);
        //do not keep error message on screen for too long, remove it after a while
        /*self.async(function() {
          self.dismissResource(resource);
        }, null, self.dismissalTimeOnError);*/
      }
      
    })
  }
  
  render() {
    return (
        <div ref="wrapper">
          <ThreeJs testProp={this.state.test} cubeRot={this.state.cube} ref="glview"/>
        </div>
    );
  }
}
