import THREE from 'three'
import Projector from './Projector';

class Selector{
  constructor(){
    this.projector = new THREE.Projector();
    
    //for camera
		this.isOrtho = false;
  }
  
  pick(event){
    event.preventDefault();
    var rect = this.container.getBoundingClientRect();

    var x =   ( (event.clientX - rect.left) / this.props.width) * 2 - 1;
    var y = - ( (event.clientY - rect.top) / this.props.height) * 2 + 1;
  
  }
  
  _pickInner( x, y, isOrtho, camera ){
    let isOrtho = isOrtho || this.isOrtho;
    let camera  = camera  || this.camera;
    var mousecoords = new THREE.Vector3(x,y,0.5);
    //v = new THREE.Vector3((x / this.viewWidth) * 2 - 1, -(y / this.viewHeight) * 2 + 1, 1);
    let v = mousecoords;
    if( !isOrtho)
		{
		  v.unproject( camera );
		  var v1 = v.clone();
		  var fooV = v.clone();
		  let raycaster = new THREE.Raycaster(camera.position, v.sub(camera.position).normalize());
		  //raycaster.precision = 10;
		  intersects = raycaster.intersectObjects(this.hiearchyRoot, true);
		}
		else
		{
				// use picking ray since it's an orthographic camera
				//var ray = this.projector.pickingRay( v, this.camera );
				//intersects = ray.intersectObjects( this.hiearchyRoot, true );
				//see here:
				THREE.Vector3.prototype.pickingRay = function ( camera ) {
            var tan = Math.tan( 0.5 * THREE.Math.degToRad( camera.fov ) ) / camera.zoom;

            this.x *= tan * camera.aspect;
            this.y *= tan; 
            this.z = - 1;

            return this.transformDirection( camera.matrixWorld );
        };
		     raycaster = new THREE.Raycaster();
         v.pickingRay( this.camera );
         raycaster.set( this.camera.position, v );
		     intersects = raycaster.intersectObjects(this.hiearchyRoot, true);
		}
		
		//remove invisibles
		intersects = intersects.filter( (intersect) => {

		  return ( intersect.object && intersect.object.visible === false );
		
		});
    
		return intersects;
    
    /*
    mousecoords.unproject(camera);
    raycaster.ray.set( camera.position, mousecoords.sub( camera.position ).normalize() );

    var intersections = raycaster.intersectObjects( this._THREEObject3D.children, true );
    var firstintersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

		if (firstintersection !== null) {
      var pickobject = firstintersection.object;
      if (typeof pickobject.userData !== 'undefined' &&
          typeof pickobject.userData.props.onPick === 'function') {
        pickobject.userData.props.onPick(event, firstintersection);
      }
    }*/
  }

}


export default Selector;
