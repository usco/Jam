export default function intent(addressbar, params){
  const loadDesign$   = addressbar.get("designId")
    .flatMap(fromArray)
    .filter(exists)

  const setAuthToken$ = addressbar.get('authToken')

  /*export function designSource(addressbar, params){
    return addressbar.get('designId')
      //.tap(e=>console.log("designUrl",e))
  }

  export function authToken(addressbar, params){
    return addressbar.get('authToken')
      //.tap(e=>console.log("authToken",e))
  }*/


  return {
    loadDesign$
    ,setAuthToken$
  }
}
