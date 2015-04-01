import THREE from "three"

var resizeMesh=function( object, minSize, maxSize )
{  
  var minSize = minSize || 0.2;
  var maxSize = maxSize || 500;
  //if(!object.boundingSphere) computeObject3DBoundingSphere( object );
  //FIXME: bsphere can be present but with a radius == infinity etc
  computeObject3DBoundingSphere( object );
  
  var size = object.boundingSphere.radius;
  if( size < minSize)
  {
    var ratio = object.boundingSphere.radius/minSize;
    var scaling = 1/ratio;
    object.applyMatrix( new THREE.Matrix4().makeScale( scaling, scaling, scaling ) );
  }
  else if(size > maxSize)
  {
    var ratio = object.boundingSphere.radius/maxSize;
    var scaling = 1/ratio;
    object.applyMatrix( new THREE.Matrix4().makeScale( scaling, scaling, scaling ) );
  }
}

export default resizeMesh;
