
export function hasModelUrl(data){
  if(data && data.hasOwnProperty("modelUrl")) return true
    return false
}
export function hasDesignUrl(data){
  if(data && data.hasOwnProperty("designUrl")) return true
    return false
}

export function validateExtension(extensions,entry){
  return extensions.indexOf(getExtension(entry)) > -1
}


export function filterExtension(input, extensions){
  extensions = extensions || {
    meshes : ["stl","3mf","amf","obj","ctm","ply"]//FIXME: not great, this makes us need an import + fill here to work
  }
  //only load meshes for resources that are ...mesh files
  const validateMeshExtension = validateExtension.bind(null,extensions.meshes)

  return input
    .filter(file => validateMeshExtension(file.name) )
    .filter(url => validateMeshExtension(url) )

    .filter(exists)
    .map(toArray)
    .filter(data => {
      data = data.filter(exists).filter(data=>!isEmpty(data))
      return  data.length > 0
    })
}