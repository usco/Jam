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

//file utils ??

export function getExtension(fname){
  return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2).toLowerCase()
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

/////////////////////////////////
//app utils
function isToolSelected(){
  return self.state.activeTool
}

//annoying
export function isNoToolSelected(activeTool){
  return !activeTool
}

/////////////////////////////////
//entity utils
export function hasEntity( input ){
  return (input.userData && input.userData.entity)
}

export function getEntity( input ){
  return input.userData.entity
}

/////////////////////////////////
//ui utils
export function toggleCursor(toggle, cursorName, element=document.body){
  if(toggle)
  {
    element.style.cursor = cursorName
  }else{
    element.style.cursor = 'default'
  }
  return toggle
}