import THREE from 'three';


/*
 *  @author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 *
 *  A general perpose camera, for setting FOV, Lens Focal Length,
 *      and switching between perspective and orthographic views easily.
 *      Use this only if you do not wish to manage
 *      both a Orthographic and Perspective Camera
 *
 * some additional changes by kaosat-dev
 */


THREE.CombinedCamera = function ( width, height, fov, near, far, orthoNear, orthoFar ) {

    THREE.Camera.call( this );

    this.fov = fov;

    this.left = -width / 2;
    this.right = width / 2
    this.top = height / 2;
    this.bottom = -height / 2;

    // We could also handle the projectionMatrix internally, but just wanted to test nested camera objects

    this.cameraO = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2,  orthoNear, orthoFar );
    this.cameraP = new THREE.PerspectiveCamera( fov, width / height, near, far );

    this.zoom = 1;

    this.toPerspective();

    var aspect = width/height;
    
    this.target = new THREE.Vector3();
    this.defaultPosition = new THREE.Vector3();
    
    /**
      Orientations:
        front: +x 
        back:  -x
        top/above : +z
        bottom/under : -z
        left: +y
        right: -y 
    */
    this.orientationMap = {
      "F": new THREE.Vector3(1,0,0),
      "B": new THREE.Vector3(-1,0,0),
      
      "A": new THREE.Vector3(0,0,1),
      "U": new THREE.Vector3(0,0,-1),
      
      "L": new THREE.Vector3(0,1,0),
      "R": new THREE.Vector3(0,-1,0),
    }
   
   //we generate methods for each an every possible case
   var orientationNameMap = {
      "F":    "Front",
      "B":    "Back",
      "L":    "Left",
      "R":    "Right",
      "A":    "Top",
      "U":    "Bottom",
      
      "FL":   "FrontLeft",
      "FR":   "FrontRight",
      "FA":   "FrontTop",
      "FU":   "FrontBottom", 
  
      "BL":   "BackLeft",
      "BR":   "BackRight",
      "BA":   "BackTop",
      "BU":   "BackBottom", 
  
      "LA":   "LeftTop",
      "LU":   "LeftBottom",
      "RA":   "RightTop",
      "RU":   "RightBottom",
  
      "FAL":   "FrontTopLeft",
      "FAR":   "FrontTopRight",
      "FUL":   "FrontBottomLeft",
      "FUR":   "FrontBottomRight",
  
      "BAL":   "BackTopLeft",
      "BAR":   "BackTopRight",
      "BUL":   "BackBottomLeft",
      "BUR":   "BackBottomRight",
    };
    
    var self = this;
    function createOrientationFunct(methodName, orCode) {
       self[methodName] = function(){
        self.orientationGenerator(orCode);
      }
    }
    
    for(var shortOrientationName in orientationNameMap)
    {
      var orientation = orientationNameMap[shortOrientationName];
      var methodName = "to"+orientation.charAt(0).toUpperCase() + orientation.slice(1)+"View";
      createOrientationFunct( methodName, shortOrientationName );
    }
    
};

THREE.CombinedCamera.prototype = Object.create( THREE.Camera.prototype );


THREE.CombinedCamera.prototype.lookAt = function () {

    // This routine does not support cameras with rotated and/or translated parent(s)

    var m1 = new THREE.Matrix4();

    return function ( vector ) {
        this.target = vector;
        if(this.inOrthographicMode===true)
        {
            this.toOrthographic();
        }
        
        m1.lookAt( this.position, vector, this.up );

       this.quaternion.setFromRotationMatrix( m1 );

    };
    

}();


THREE.CombinedCamera.prototype.toPerspective = function () {

    // Switches to the Perspective Camera

    this.near = this.cameraP.near;
    this.far = this.cameraP.far;

    this.cameraP.fov =  this.fov / this.zoom ;

    this.cameraP.updateProjectionMatrix();

    this.projectionMatrix = this.cameraP.projectionMatrix;

    this.inPerspectiveMode = true;
    this.inOrthographicMode = false;

};

THREE.CombinedCamera.prototype.toOrthographic = function () {

    // Switches to the Orthographic camera estimating viewport from Perspective

    var fov = this.fov;
    var aspect = this.cameraP.aspect;
    var near = this.cameraP.near;
    var far = this.cameraP.far;
    
    
    //set the orthographic view rectangle to 0,0,width,height
    //see here : http://stackoverflow.com/questions/13483775/set-zoomvalue-of-a-perspective-equal-to-perspective
    if(this.target === null)
    {
      this.target = new THREE.Vector3();
    }
    var distance = new THREE.Vector3().subVectors(this.position,this.target).length()*0.3;
    var width = Math.tan(fov) * distance * aspect;
    var height = Math.tan (fov) * distance;
    
    var halfWidth = width;
    var halfHeight = height;

    this.cameraO.left = halfWidth;
    this.cameraO.right = -halfWidth;
    this.cameraO.top = -halfHeight;
    this.cameraO.bottom = halfHeight;


    this.cameraO.updateProjectionMatrix();

    this.near = this.cameraO.near;
    this.far = this.cameraO.far;
    this.projectionMatrix = this.cameraO.projectionMatrix;

    this.inPerspectiveMode = false;
    this.inOrthographicMode = true;

};


THREE.CombinedCamera.prototype.setSize = function( width, height ) {

    this.cameraP.aspect = width / height;
    this.left = -width / 2;
    this.right = width / 2
    this.top = height / 2;
    this.bottom = -height / 2;

};


THREE.CombinedCamera.prototype.setFov = function( fov ) {

    this.fov = fov;

    if ( this.inPerspectiveMode ) {

        this.toPerspective();

    } else {

        this.toOrthographic();

    }

};

// For mantaining similar API with PerspectiveCamera

THREE.CombinedCamera.prototype.updateProjectionMatrix = function() {

    if ( this.inPerspectiveMode ) {

        this.toPerspective();

    } else {

        this.toPerspective();
        this.toOrthographic();

    }

};

/*
* Uses Focal Length (in mm) to estimate and set FOV
* 35mm (fullframe) camera is used if frame size is not specified;
* Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
*/
THREE.CombinedCamera.prototype.setLens = function ( focalLength, frameHeight ) {

    if ( frameHeight === undefined ) frameHeight = 24;

    var fov = 2 * THREE.Math.radToDeg( Math.atan( frameHeight / ( focalLength * 2 ) ) );

    this.setFov( fov );

    return fov;
};


THREE.CombinedCamera.prototype.setZoom = function( zoom ) {

    this.zoom = zoom;

    if ( this.inPerspectiveMode ) {
        this.toPerspective();
    } else {
        this.toOrthographic();
    }
    
};


THREE.CombinedCamera.prototype.toDiagonalView = function() {
    this.position.copy( this.defaultPosition );
    this.target = new THREE.Vector3();
    this.lookAt( this.target );
};

THREE.CombinedCamera.prototype.orientationGenerator=function( name ){

  //name is a string of letters of length 1 to 3 representing
  // the desired orientation : ex : a: above, r: right, ar: above right
  //, flb: front left bottom
  
  var offset = this.position.clone().sub(this.target);
  var components = name;
  //console.log("offset distance",offset.length()); 
  
  var combinedTransform = new THREE.Vector3();
  for(var i=0;i<components.length;i++)
  {
    //console.log("handling", components[i] );
    var component = components[i];
    var nPost = this.orientationMap[component].clone();//.multiplyScalar( offset.length() );
    
    combinedTransform.add( nPost );
  }
  combinedTransform.setLength( offset.length() );
  //console.log("offset disance 2",combinedTransform.length() );
  this.position.copy( combinedTransform );

  //console.log("offset disance 3",this.position.clone().sub(this.target).length() );
  this.lookAt( this.target );
  //console.log("offset disance 4",this.position.clone().sub(this.target).length() );
}

/*THREE.CombinedCamera.prototype.toFrontView = function() {
    
    var offset = this.position.clone().sub( this.target );
    var nPost = new  THREE.Vector3();
    nPost.y = -offset.length();
    this.position.copy( nPost );
    this.lookAt( this.target );
};

THREE.CombinedCamera.prototype.toFrontLeftView = function() {
    //TODO: check posisitoning
    var offset = this.position.clone().sub( this.target );
    var nPost = new  THREE.Vector3();
    nPost.y = -offset.length();
    nPost.x = -offset.length();
    this.position.copy( nPost );
    this.lookAt( this.target );
};

THREE.CombinedCamera.prototype.toFrontRightView = function() {
    //TODO: check posisitoning
    var offset = this.position.clone().sub( this.target );
    var nPost = new  THREE.Vector3();
    nPost.y = -offset.length();
    nPost.x = offset.length();
    this.position.copy( nPost );
    this.lookAt( this.target );
};

THREE.CombinedCamera.prototype.toFrontTopView = function() {
    //TODO: check posisitoning
    var offset = this.position.clone().sub( this.target );
    var nPost = new  THREE.Vector3();
    nPost.y = -offset.length();
    nPost.z = offset.length();
    this.position.copy( nPost );
    this.lookAt( this.target );
};

THREE.CombinedCamera.prototype.toFrontBottomView = function() {
    //TODO: check posisitoning
    var offset = this.position.clone().sub( this.target );
    var nPost = new  THREE.Vector3();
    nPost.y = -offset.length();
    nPost.z = -offset.length();
    this.position.copy( nPost );
    this.lookAt( this.target );
};

THREE.CombinedCamera.prototype.toBackView = function() {

    var offset = this.position.clone().sub(this.target);
    var nPost = new  THREE.Vector3();
    nPost.y = offset.length();
    this.position.copy(nPost);
    this.lookAt(this.target);
};

THREE.CombinedCamera.prototype.toLeftView = function() {
    
    var offset = this.position.clone().sub(this.target);
    var nPost = new  THREE.Vector3();
    nPost.x = offset.length();
    this.position.copy(nPost);
    this.lookAt(this.target);
    
};

THREE.CombinedCamera.prototype.toRightView = function() {
    var offset = this.position.clone().sub(this.target);
    var nPost = new  THREE.Vector3();
    nPost.x = -offset.length();
    this.position.copy( nPost );
    this.lookAt(this.target );
};

THREE.CombinedCamera.prototype.toTopView = function() {
    this.orientationGenerator( "a" );
};

THREE.CombinedCamera.prototype.toBottomView = function() {
    var offset = this.position.clone().sub(this.target);
    var nPost = new  THREE.Vector3();
    nPost.z = -offset.length();
    this.position.copy( nPost );
    this.lookAt( this.target );
};*/

THREE.CombinedCamera.prototype.centerView = function() {
    //var offset = new THREE.Vector3().sub(this.target.clone());
    //this.position= new THREE.Vector3(100,100,200);
    //this.target = new THREE.Vector3();
   
    this.position.copy( this.defaultPosition );
    this.lookAt( this.target );
};

THREE.CombinedCamera.prototype.resetView = function() {
    this.position.copy( this.defaultPosition );
    this.target.copy( new THREE.Vector3() );
};

export default THREE.CombinedCamera;
