/////////////////////////////////
//generic utils
export function first(input){
  return input[0]
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

function toggleTool(toolName){
  let activeTool = self.state.activeTool
  let val = toolName
  activeTool = (activeTool === val ? undefined: val)
  self.setState({
    activeTool: activeTool
  },null,false)

  return activeTool === val
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
export function toggleCursor(toggle, cursorName){
  if(toggle)
  {
    document.body.style.cursor = cursorName
  }else{
    document.body.style.cursor = 'default'
  }
  return toggle
}