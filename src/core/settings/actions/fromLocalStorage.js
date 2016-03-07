export default function intent(localStorage, params){
  const setAllValues$ =  localStorage.get("jam!-settings")

  return {
    setAllValues$
  }
}
