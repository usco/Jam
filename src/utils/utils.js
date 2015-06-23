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