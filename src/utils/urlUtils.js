import url from 'url'

export function fetchUriParams(uri, paramName){
  let params = url.parse(uri, true)
  let result = params.query
  //TODO: always return query
  if(paramName in result) return [].concat( result[paramName] )
  return []
}

export function getUriQuery(uri){
  let uriData = url.parse(uri)
  let query   = uriData.query
  return query
}
  
export function setWindowPathAndTitle(urlPath, title=""){
  //clear url related stuff
  urlPath   = urlPath || (location.protocol + '//' + location.host + location.pathname)
  let pageTitle = title
  document.title = pageTitle
  window.history.pushState({"pageTitle":pageTitle},"", urlPath)
}