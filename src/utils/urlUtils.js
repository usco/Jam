import url from 'url'

export function fetchUriParams(uri, paramName){
  let targetUrl = window.location.href
  let params = url.parse(targetUrl, true)
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
  
