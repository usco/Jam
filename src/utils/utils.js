export function trim(string){
  return String(string).replace(/^\s+|\s+$/g, '');
}

export function exists(input){
  return input !== null && input !== undefined
}

//utiity to determine if a string is empty, null, or full of whitespaces
export function isEmpty(str) {
    return (!str || /^\s*$/.test(str) || str.length === 0 || !str.trim())
}

export function itemsEqual(a,b){
  //perhaps an immutable library would not require such horrors?
  if(JSON.stringify(a)===JSON.stringify(b)){
    return true
  }
  return false
}

/*converts input data to array if it is not already an array*/
export function toArray(data){
  if(!data) return []
  if(data.constructor !== Array) return [data]
  return data
}

/* JSON parse that always returns an object*/
export function safeJSONParse(str){
  try{
    return JSON.parse(str) || {} //from cycle.js
  }catch(error){
    throw new Error("Error parsing data",JSON.stringify(str))
  }
}

//file utils ??
export function getExtension(fname){
  return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2).toLowerCase()
}

//TODO: taken from three.js ,do correct attribution
export function generateUUID() {

  // http://www.broofa.com/Tools/Math.uuid.htm

  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
  let uuid = new Array( 36 );
  let rnd = 0, r;

  return function () {

    for ( let i = 0; i < 36; i ++ ) {

      if ( i == 8 || i == 13 || i == 18 || i == 23 ) {

        uuid[ i ] = '-';

      } else if ( i == 14 ) {

        uuid[ i ] = '4';

      } else {

        if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[ i ] = chars[ ( i == 19 ) ? ( r & 0x3 ) | 0x8 : r ];

      }
    }
    return uuid.join( '' )
  }()
}