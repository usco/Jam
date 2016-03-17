//detect node for conditional import for jsonToFormData
const isNode = typeof process !== 'undefined' && process.versions && !!process.versions.node
if(isNode){
  console.log(" import formData")
  // TODO : deal with node.js side  for example using https://www.npmjs.com/package/form-data: fake one for now
}

export function jsonToFormData(jsonData){
  jsonData = JSON.parse( JSON.stringify( jsonData ) )
  let formData = undefined
  if(isNode){
    formData = {append:function(fieldName,value){}}//FIXME: hack for tests/nodes.js 
  }else{
    formData = new FormData()
  }
  for(let fieldName in jsonData){
    let value = jsonData[fieldName]
    //value = encodeURIComponent(JSON.stringify(value))
    //value = JSON.stringify(value)
    //value = value.replace(/\"/g, '')
    if(Object.prototype.toString.call(value) === "[object Object]"){
      value = JSON.stringify(value)
      // console.log("value",value)
    }
    if(Object.prototype.toString.call(value) === "[object Array]"){
      //value = //JSON.stringify(value)
      //value = 'arr[]', arr[i]//value.reduce()
      //console.log("value",value)
      value = `{ ${value.join(',')} }`
    }

    //console.log("append",fieldName, value)
    formData.append(fieldName, value)

  }
  return formData
}
