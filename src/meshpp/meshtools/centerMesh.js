import THREE from "three"

var centerMesh=function( object, onX, onY, onZ )
{
  //TODO: should this be added to our object/mesh classes
  var onX = onX === undefined ? false: onX;
  var onY = onY === undefined ? false: onY;
  var onZ = onZ === undefined ? true: onZ;
  
  //centering hack
  if(!object.boundingSphere) computeObject3DBoundingSphere( object );
  var offset = object.boundingSphere.center;
  
  object.traverse(function(item)
  {
    if(item.geometry){
      item.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( -offset.x, -offset.y, -offset.z ) );
    }
  });
  
  //offset to move the object above given planes
  if(onZ)
  {
    var h = object.boundingBox.max.z  - object.boundingBox.min.z ;
    object.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, h/2 ) );
  }
  
  if(onY)
  {
    var d = object.boundingBox.max.y  - object.boundingBox.min.y ;
    object.applyMatrix( new THREE.Matrix4().makeTranslation( 0, d/2, 0 ) );
  }
  
  if(onX)
  {
    var w = object.boundingBox.max.x  - object.boundingBox.min.x ;
    object.applyMatrix( new THREE.Matrix4().makeTranslation( w/2, 0, 0 ) );
  }
}

export default centerMesh ;
