export function intent(addressbar){
  const loadDesign$ = addressbar.get("designUrl")
  
  return {
    loadDesign$
  } 
}