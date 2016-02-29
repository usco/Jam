export function intent(addressbar, params){
  const loadDesign$   = addressbar.get("designUrl")
  const setAuthToken$ = addressbar.get('authToken')

  return {
    loadDesign$
    ,setAuthToken$
  }
}
