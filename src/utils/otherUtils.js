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

export function extractMeshTransforms(mesh){
  let attrs = {
    pos:mesh.position,
    rot:mesh.rotation,
    sca:mesh.scale
  }
  return attrs
}

function attributesToArrays(attrs){
  let output= {}
  for(let key in attrs){
    output[key] = attrs[key].toArray()
  }
  //special case for rotation
  if("rot" in attrs)
  {
    output["rot"] = output["rot"].slice(0,3)
  }
  return output
}

function setEntityT(attrsAndEntity){
  let [transforms, entity] = attrsAndEntity      
  setEntityData$({entity:entity,
    pos:transforms.pos,
    rot:transforms.rot,
    sca:transforms.sca
  })

  return attrsAndEntity
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