/////////////////////////////////
//generic utils
export function first(input){
  return input[0]
}

export function flipValue__(newValue, oldValue){
  let val = newValue
  let outValue = (oldValue === newValue ? undefined: newValue)

  return outValue 
}


/////

/*returns an object's (deep) property, given a path as string
taken from : http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
*/
export function getPropertyByPath(obj, path) {
    /*if(path && path.indexOf('.') === -1) {
      path = "."+path
    }*/

    let parts = path.split('.'),
      last = parts.pop(),
      l = parts.length,
      i = 1,
      current = parts[0]

    while (l > 0 && (obj = obj[current]) && i < l) {
      current = parts[i]
      i++
    }

    if(obj) {
      return obj[last]
    }
}

export function setPropertyByPath(obj, path, value) {
    let parts = path.split('.'),
      last = parts.pop(),
      l = parts.length,
      i = 1,
      current = parts[0]

    while (l > 0 && (obj = obj[current]) && i < l) {
      current = parts[i]
      i++
    }

    if(obj) {
      obj[last] = value
    }
}


