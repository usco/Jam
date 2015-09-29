export function trim(string){
  return String(string).replace(/^\s+|\s+$/g, '');
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
  return JSON.parse(str) || {} //from cycle.js
}

//file utils ??
export function getExtension(fname){
  return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2).toLowerCase()
}