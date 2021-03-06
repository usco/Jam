// ///////////////////////////////
// entity utils
export function hasEntity (input) {
  return (input && input.userData && input.userData.entity)
}

// this one should not be needed
export function hasNoEntity (input) {
  return !(input && input.userData && input.userData.entity)
}

export function getEntity (input) {
  return input.userData.entity
}
