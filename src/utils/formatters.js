
//format a number to the given precision
export function formatNumberTo(input, precision) {
  return parseFloat(Math.round(input * 100) / 100).toFixed(precision)
}

export function capitalize(s){
  return s && s[0].toUpperCase() + s.slice(1)
}

//format an angle value from degrees to radian
export function toRadian (input){
  if(!input) return 0
  return parseFloat( input )*Math.PI/180
}

//format an angle from radian to deg
export function toDegree (input)
{
  if(!input) return 0
  return input*180/Math.PI
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
export function threejsColorToHex (input){
  if(!input)
    return "#ffffff"
  return "#"+input.getHexString()
}

//convert between three.js color & html hex color
export function hexToThreejsColor (input){
  return new THREE.Color(value)
}


 //turns a string into a camelcase string (for variable names)
 export function toCamelCase (input){
  if(!input)
    return ""
  return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
    return group1.toUpperCase()
  })
 }

 //and back
 export function toRevCamelCase (input){
    if(!input)
      return ""
    return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
        return group1.toUpperCase()
    })
 }

export function hashCodeFromString(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)
}


//TODO remove redundandt ones
function camelCase (string) {
  return string.replace( /-([a-z])/ig, function( all, letter ) {
      return letter.toUpperCase()
  })
}

function camelCase2 (string) {
  return string.replace( /-([a-z])/ig, function( all, letter ) {
      return letter.toUpperCase()
  })
}
//TODO: do this better
export function nameCleanup( name ){
  let cName = name
  if(name.indexOf('.')!==-1){
    cName = name.substr(0, name.lastIndexOf('.'))
  }
  cName = camelCase(cName)
  cName = camelCase2(cName)
  //cName = cName.replace("_","").replace("-","");
  return cName
}

/*generate a url-valid string from the input string :ie remove spaces, */
export function normalizeString(string){
  return string.toLowerCase().replace(/\./g, '-').replace(/ /g, '-')
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
