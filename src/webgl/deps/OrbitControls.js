import THREE from 'three';//'./Three.min.js';

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

var OrbitControls = function ( object, domElement, upVector ) {

    //this.object = object;
    this.objects = [];
    
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    this.upVector = upVector || new THREE.Vector3(0,1,0);

    // API
    this.rotateButton = 2;
    this.panButton = 14;
    this.panKeyPressed = false;
    
    this.enabled = true;

    //this.center = new THREE.Vector3();
    this.centers = [];

    this.userZoom = true;
    this.userZoomSpeed = 1.0;

    this.userRotate = true;
    this.userRotateSpeed = 1.0;

    this.userPan = true;
    this.userPanSpeed = 2.0;

    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    this.minDistance = 0.2;
    this.maxDistance = 600;

    // 65 /*A*/, 83 /*S*/, 68 /*D*/
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, ROTATE: 65, ZOOM: 83, PAN: 16};//68 };

    this.active = false;
    this.mainPointerPressed = false;

    // internals

    var scope = this;

    var EPS = 0.000001;
    var PIXELS_PER_ROUND = 1800;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var zoomStart = new THREE.Vector2();
    var zoomEnd = new THREE.Vector2();
    var zoomDelta = new THREE.Vector2();

    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;
    
    var origPhiDelta = phiDelta;
    var origThetaDelta = thetaDelta;
    var origScale = scale;

    var lastPosition = new THREE.Vector3();

    var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
    var state = STATE.NONE;

    this.camStates = [];
    //to add control of multiple cameras
    this.addObject = function( object ){
      if(this.objects.indexOf(object) != -1) return;
      this.objects.push( object );
      this.centers.push( new THREE.Vector3() );
      this.camStates.push( {phiDelta:0,thetaDelta:0,scale:0,lastPosition:new THREE.Vector3()} );
    };

    // events

    var changeEvent = { type: 'change' };


    function fireActivated(){
      //console.log("dea move",scope.active);
      if(!scope.active && scope.mainPointerPressed){
        scope.active = true;
        scope.dispatchEvent({type:'activated'});
      }
    }
      
    function fireDeActivated(){
      //console.log("pointer move",scope.active);
      if(scope.active){
        scope.active = false;
        scope.dispatchEvent({type:'deactivated'});
      }
    } 

    this.rotateLeft = function ( angle ) {

        if ( angle === undefined ) {
          angle = 2 * Math.PI /180  * scope.userRotateSpeed;
        }

        thetaDelta += angle;
    };

    this.rotateRight = function ( angle ) {

        if ( angle === undefined ) {
          angle = 2 * Math.PI /180  * scope.userRotateSpeed;
        }

        thetaDelta -= angle;

    };

    this.rotateUp = function ( angle ) {

        if ( angle === undefined ) {
          angle = 2 * Math.PI /180  * scope.userRotateSpeed;    
        }

        phiDelta -= angle;

    };

    this.rotateDown = function ( angle ) {

        if ( angle === undefined ) {
          angle = 2 * Math.PI /180  * scope.userRotateSpeed;
        }

        phiDelta += angle;

    };

    this.zoomIn = function ( zoomScale ) {

        if ( zoomScale === undefined ) {

            zoomScale = getZoomScale();
        }
        scale /= zoomScale;
        this.scale = scale;
    };

    this.zoomOut = function ( zoomScale ) {

        if ( zoomScale === undefined ) {

            zoomScale = getZoomScale();
        }
        scale *= zoomScale;
        this.scale = scale;
    };

    this.pan = function ( distance ) {
        //fixme:
        var _origDist = distance.clone();
        for(var i=0;i<this.objects.length;i++)
        {
          var distance = _origDist.clone();
          distance.transformDirection( this.objects[i].matrix );
          distance.multiplyScalar( scope.userPanSpeed );
          
          this.objects[i].position.add( distance );
          this.centers[i].add( distance );
        }

       
    };

    this.update = function (dt) {
        //this is a modified version, with inverted Y and Z (since we use camera.z => up)
        //we also allow multiple objects/cameras
        for(var i =0; i< this.objects.length;i++)
        {
          var object = this.objects[i];
          var center = this.centers[i];
          var camState = this.camStates[i];
          
          var curThetaDelta = thetaDelta;
          var curPhiDelta   = phiDelta;
          var curScale      = scale;
          
          var lastPosition = camState.lastPosition;
          
          var position = object.position;
          var offset = position.clone().sub( center );

          if(this.upVector.z == 1)
          {
            // angle from z-axis around y-axis, upVector : z
            var theta = Math.atan2( offset.x, offset.y );
            // angle from y-axis
            var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.y * offset.y ), offset.z );
          }
          else
          {
            //in case of y up
            var theta = Math.atan2( offset.x, offset.z );
            var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );
            curThetaDelta = -(curThetaDelta);
          }

          if ( this.autoRotate ) {
              this.rotateLeft( getAutoRotationAngle() );
              curThetaDelta = thetaDelta;
          }

          theta += curThetaDelta;
          phi += curPhiDelta;

          // restrict phi to be between desired limits
          phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );
          // restrict phi to be betwee EPS and PI-EPS
          phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );
          //multiply by scaling effect
          var radius = offset.length() * curScale;
          // restrict radius to be between desired limits
          radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

          if(this.upVector.z == 1)
          {
            offset.x = radius * Math.sin( phi ) * Math.sin( theta );
            offset.z = radius * Math.cos( phi );
            offset.y = radius * Math.sin( phi ) * Math.cos( theta );
          }
          else
          {
            offset.x = radius * Math.sin( phi ) * Math.sin( theta );
            offset.y = radius * Math.cos( phi );
            offset.z = radius * Math.sin( phi ) * Math.cos( theta );
          }

          //
          position.copy( center ).add( offset );
          object.lookAt( center );

          if ( lastPosition.distanceTo( object.position ) > 0 ) {
              //this.active = true;
              this.dispatchEvent( changeEvent );

              lastPosition.copy( object.position );
              
              fireActivated();
          }
          else
          {
            fireDeActivated();
          }
          
        }
        //thetaDelta = 0;
        //phiDelta = 0;
        thetaDelta /= 1.5;
        phiDelta /= 1.5;
        scale = 1;
    };


    function getAutoRotationAngle() {

        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

        return Math.pow( 0.95, scope.userZoomSpeed );

    }

    function onMouseDown( event ) {
      console.log("blaaah");
        if ( scope.enabled === false ) return;
        if ( scope.userRotate === false ) return;
        //event.preventDefault();

        //FIXME : make it configurable
        if ( state === STATE.NONE )
        {
            if ( event.button === scope.rotateButton ) 
                state = STATE.ROTATE;
            if ( event.button === 1 )
                state = STATE.ZOOM;
            if ( event.button === scope.panButton )
                state = STATE.PAN;
        }
        
        
        if ( state === STATE.ROTATE ) {
            rotateStart.set( event.clientX, event.clientY );

        } else if ( state === STATE.ZOOM ) {
            zoomStart.set( event.clientX, event.clientY );

        } else if ( state === STATE.PAN ) {
            //state = STATE.PAN;
        }
        document.addEventListener( 'mousemove', onMouseMove, false );
        document.addEventListener( 'up', onMouseUp, false );
    }

    function onMouseMove( event ) {
        if ( scope.enabled === false ) return;
        
        //event.preventDefault();
        
        if ( state === STATE.ROTATE ) {

            rotateEnd.set( event.clientX, event.clientY );
            rotateDelta.subVectors( rotateEnd, rotateStart );

            scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
            scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

            rotateStart.copy( rotateEnd );

        } else if ( state === STATE.ZOOM ) {

            zoomEnd.set( event.clientX, event.clientY );
            zoomDelta.subVectors( zoomEnd, zoomStart );

            if ( zoomDelta.y > 0 ) {

                scope.zoomIn();

            } else {

                scope.zoomOut();

            }

            zoomStart.copy( zoomEnd );

        } else if ( state === STATE.PAN ) {
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );

        }

    }

    function onMouseUp( event ) {
        if ( scope.enabled === false ) return;
        if ( scope.userRotate === false ) return;
        scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
        scope.domElement.removeEventListener( 'up', onMouseUp, false );
        state = STATE.NONE;
        
    }

    function onMouseWheel( event ) {
        if ( scope.enabled === false ) return;
        if ( scope.userZoom === false ) return;

        var delta = 0;

        if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if ( event.detail ) { // Firefox older

            delta = - event.detail;

        }else if( event.deltaY ) { // Firefox
            
            delta = -event.deltaY;
        
        }

        if ( delta > 0 ) {

            scope.zoomOut();
            
            /*if(!scope.active){
              scope.active = true;
              scope.dispatchEvent({type:'activated'});
            }
            scope.active = false;
            scope.dispatchEvent({type:'deactivated'});*/

        } else {

            scope.zoomIn();
        }

    }

    function onKeyDown( event ) {
        if ( scope.enabled === false ) return;
        if ( scope.userPan === false ) return;

        switch ( event.keyCode ) {

            /*case scope.keys.UP:
                scope.pan( new THREE.Vector3( 0, 1, 0 ) );
                break;
            case scope.keys.BOTTOM:
                scope.pan( new THREE.Vector3( 0, - 1, 0 ) );
                break;
            case scope.keys.LEFT:
                scope.pan( new THREE.Vector3( - 1, 0, 0 ) );
                break;
            case scope.keys.RIGHT:
                scope.pan( new THREE.Vector3( 1, 0, 0 ) );
                break;
            */
            case scope.keys.ROTATE:
                state = STATE.ROTATE;
                break;
            case scope.keys.ZOOM:
                state = STATE.ZOOM;
                break;
            case scope.keys.PAN:
                state = STATE.PAN;
                break;
                
        }

    }
    
    function onKeyUp( event ) {

        switch ( event.keyCode ) {

            case scope.keys.ROTATE:
            case scope.keys.ZOOM:
            case scope.keys.PAN:
                state = STATE.NONE;
                break;
        }
    }
    
    this.enable= function (){
    	scope.enabled = true;
    	this.enabled = true;
    	state = STATE.NONE;
    }
    
    this.disable = function(){
    	scope.enabled = false;
    	this.enabled = false;
    	state = STATE.NONE;
    }

    function onPinch( event ) {
        if ( scope.enabled === false ) return;
        if ( scope.userZoom === false ) return;
        scope.domElement.removeEventListener( 'mousemove', onPointerMove, false );
        scope.domElement.removeEventListener( 'up', onPointerUp, false );
        var delta = 0;
        delta = event.scale;
        //scope.userZoomSpeed = 0.4;
        //console.log("pinching",delta);
        
        if ( delta > 1 ) {
            //console.log("zooming out");
            scope.zoomOut();
        } else {
            //console.log("zooming in");
            scope.zoomIn();
        }
        scope.pointers = {};
    }

    function onPointerDown( event )
    {
      console.log("pointer down in orbit controls");
      //scope.pointers[event.pointerId] = {x: event.pageX, y: event.pageY};
  
      /*if(Object.keys(scope.pointers).length >1 && event.pointerType !== 'mouse'){
        //console.log("more than one pointer, pinch zoom etc enabled",Object.keys(scope.pointers).length);
        state = STATE.NONE;
        return;
      }*/
      //FIXME: scope.active = true; should also work with autorotate
      
      if ( scope.enabled === false ) return;
      if ( scope.userRotate === false ) return;
        //event.preventDefault();
        if ( state === STATE.NONE )
        {
            if ( event.button === scope.rotateButton )
                state = STATE.ROTATE;
            if ( event.button === 1 )
                state = STATE.ZOOM;
            if ( event.button === scope.panButton )
                state = STATE.PAN;
            
        }
        if( state !== STATE.NONE ){
          scope.mainPointerPressed = true;
        }
        
        
        if ( state === STATE.ROTATE ) {
            rotateStart.set( event.clientX, event.clientY );
            /*event.preventDefault();
			      event.stopPropagation();
			      event.stopImmediatePropagation();*/

        } else if ( state === STATE.ZOOM ) {
            zoomStart.set( event.clientX, event.clientY );
            
            /*event.preventDefault();
			      event.stopPropagation();
			      event.stopImmediatePropagation();*/

        } else if ( state === STATE.PAN ) {
            //state = STATE.PAN;
            /*event.preventDefault();
			      event.stopPropagation();
			      event.stopImmediatePropagation();*/
        }
        scope.domElement.addEventListener( 'mousemove', onPointerMove, false );
        scope.domElement.addEventListener( 'up', onPointerUp, false );
        
        
        
        //scope.dispatchEvent( { type: 'active' } );
        
    }

    function onPointerUp( event )
    {

      //delete scope.pointers[event.pointerId];
      state = STATE.NONE;
      
      scope.mainPointerPressed = false; 
      
      fireDeActivated();

      scope.domElement.removeEventListener( 'mousemove', onPointerMove, false );
      scope.domElement.removeEventListener( 'up', onPointerUp, false );
              
      
    }

    function onPointerMove( event )
    {
    
      //console.log("Pointer move, in orbit controls");
      //if(event.button ==2 ) console.log("pointer move", event);
      //is primary
        if ( scope.enabled === false ) return;
        event.preventDefault();
        event.stopPropagation();
        
        if ( state === STATE.ROTATE ) {
        

            rotateEnd.set( event.clientX, event.clientY );
            rotateDelta.subVectors( rotateEnd, rotateStart );

            scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
            scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

            rotateStart.copy( rotateEnd );

        } else if ( state === STATE.ZOOM ) {
        
            zoomEnd.set( event.clientX, event.clientY );
            zoomDelta.subVectors( zoomEnd, zoomStart );
            scope.userZoomSpeed = 0.6;
            if ( zoomDelta.y > 0 ) {
                scope.zoomIn();
            } else {
                scope.zoomOut();
            }
            //zoomStart.copy( zoomEnd );

        } else if ( state === STATE.PAN ) {
            
            //console.log(event);
            var pointerId = event.button;//event.pointerId
            //FIXME: polymer pointer events is broken 
            var pointerData = scope.pointers[pointerId];
            if(pointerId && pointerData)
            {
              var newPointerData = {x: event.pageX, y: event.pageY};
              var movementX = (newPointerData.x - pointerData.x);
              var movementY = (newPointerData.y - pointerData.y);
              scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );
              //scope.userPanSpeed = 4.0;

              scope.pointers[pointerId] = newPointerData;
            }
            else{
              var newPointerData = {x: event.pageX, y: event.pageY};
              scope.pointers[pointerId] = newPointerData;
            }
        }
        
        return false;
    }
    
    this.reset = function(){
      for(var i=0;i<this.objects.length;i++)
      {
        var center = this.centers[i];
        center = new THREE.Vector3();
      }
      this.phiDelta= origPhiDelta;
      this.thetaDelta= origThetaDelta ;
      this.scale = origScale = scale;
      this.update();
    } 
    
    this.setDomElement=function(domElement)
    {
      console.log("attaching orbit controls to", domElement);
      this.domElement = domElement;
      this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
      this.domElement.addEventListener( 'pinch', onPinch, false);
      
      //this.domElement.addEventListener( 'down', onPointerDown, false );
      this.domElement.addEventListener( "mousedown", onPointerDown, false );
		  this.domElement.addEventListener( "touchstart", onPointerDown, false );
      
      
      //this.domElement.addEventListener( 'up', onPointerUp, false );
  		this.domElement.addEventListener( "mouseup", onPointerUp, false );
		  this.domElement.addEventListener( "mouseout", onPointerUp, false );
		  this.domElement.addEventListener( "touchend", onPointerUp, false );
		  this.domElement.addEventListener( "touchcancel", onPointerUp, false );
		  this.domElement.addEventListener( "touchleave", onPointerUp, false );
      
      
      this.domElement.addEventListener( 'mousemove', onPointerMove, false );
      
      window.addEventListener( 'keydown', onKeyDown, false );
      window.addEventListener( 'keyup', onKeyUp, false );
      
      //from MDN
      var wheelSupport = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
              document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
              "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
      
      this.domElement.addEventListener( 'wheel', onMouseWheel, false );
      //this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
    }

    scope.pointers= {};
    
};

OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );

module.exports = OrbitControls;
