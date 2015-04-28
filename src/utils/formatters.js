
//format a number to the given precision
export let formatNumberTo = function(input, precision) { return parseFloat(Math.round(input * 100) / 100).toFixed(precision) };


//format an angle value from degrees to radian
export let toRadian  = function(input){
  if(!input) return 0;
  return parseFloat( input )*Math.PI/180;
}
//format an angle from radian to deg
export let toDegree  = function(input) 
{
  if(!input) return 0;
  return input*180/Math.PI;
}


//convert between scale and absolute size
export function absSizeFromBBox(input) 
{
  //console.log("getting absolute size");
  if(!input) return undefined;
  let size = {w:0,l:0,h:0};
  //ordering is always x,y,z

  let bbox   = input ;
  /*let length = ( (bbox.max.x-bbox.min.x).toFixed(2) )/1; // division by one to coerce to number
  let width  = ( (bbox.max.y-bbox.min.y).toFixed(2) )/1;
  let height = ( (bbox.max.z-bbox.min.z).toFixed(2) )/1;*/

  let length = ( (bbox.max[0]-bbox.min[0]).toFixed(2) )/1; // division by one to coerce to number
  let width  = ( (bbox.max[1]-bbox.min[1]).toFixed(2) )/1;
  let height = ( (bbox.max[2]-bbox.min[2]).toFixed(2) )/1;

  size.w = width;
  size.l = length;
  size.h = height;
  return size;
}

//convert rel size to abs size
export function toRelSize(input) 
{
}

//convert rel size to abs size
export function toRelSize2(input) 
{
}


//convert between html hex color and three.js color
export let threejsColorToHex = function(input){
  if(!input) return "#ffffff"; return "#"+input.getHexString()
}
//convert between three.js color & html hex color 
export let hexToThreejsColor = function(input){
  return new THREE.Color(value);
}


 //turns a string into a camelcase string (for variable names)
 export let toCamelCase = function(input){
  if(!input) return "";
  return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
          return group1.toUpperCase();
  });
 }
 //and back
 export let toRevCamelCase = function(input){
    if(!input) return "";
    return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
 }


      
//OLD polymer code, to be converted
/*

  //convert between scale and absolute size
  scaleConvert: {
     toDOM: function(value, axis) {
      if(!value) return 0;
      return this.meshSize[axis];
    },
    toModel: function(value, axis) {
      //TODO : do the "safing" of values better( no divisions by zero, nothing under 0 )
      var minScale = 0.0001;
      if(!value) return minScale;
      
      if(value <= 0) value = minScale;
      //var foo = this.meshSize[axis];
      var map = {"l":"x","w":"y","h":"z"};
      var mapped = map[axis];
      var axisScale = this.selectedObject.scale[ mapped ];
      if( axisScale <= minScale ) axisScale = minScale;
      
      var scaling = 1/ axisScale;
      
      var meshSize = this.meshSize[axis];
      if(meshSize <= minScale) meshSize = minScale;
      
      var originalSize = meshSize * scaling;
      var targetScale = value/(originalSize);
      
      
      if(targetScale <= minScale) targetScale = minScale;
      
      if(this.meshSize[axis] <= minScale) this.meshSize[axis] = minScale;
      
      this.selectedObject.scale[mapped] = targetScale;
      return targetScale;
    }
  },
  }*/