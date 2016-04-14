import {required, validate} from 'o-validator'
import {is, allPass} from 'ramda'

export function validate() {

}

export function makeValidators () {
  /* this validates any "addPartData" action
  obs: observable action to validate
  */
  function addPartData (obs) {
    obs
      .filter(data => data.length > 0) // we expect data to be an array like object
      .filter() // TODO: add others

    const schema = {
      title: required(is(String)),
      description: allPass([is(String), hasLengthGreaterThan(5)]),
      isActive: is(Boolean),
      tags: is(Array)
    }

    validate(schema, {
      title: 'Hi There',
      description: 'This is a great post.',
      isActive: true
    // tags are not defined - but that is OK, validator treats them as optional
    })
  }

  /* this validates any "removePartData" action
  obs: observable action to validate
  */
  function removePartData (obs) {
    obs
      .filter(data => data.length > 0) // we expect data to be an array like object
      .filter() // TODO: add others
  }

  /* this validates any "removePartData" action
  obs: observable action to validate
  */
  function removePartData (obs) {
    obs
      .filter(data => data.length > 0) // we expect data to be an array like object
      .filter() // TODO: add others
  }

  const removeTypes$ = removePartData$
    .map(function (data) {
      return data.map(entry => ({ id: entry.uuid }))
    })
    .tap(e => console.log('removeTypes (fromPostMessage)', e))

  const deleteInstances$ = removePartData$
    .map(function (data) {
      return data.map(entry => ({typeUid: entry.uuid}))
    })
    .tap(e => console.log('deleteInstances (fromPostMessage)', e))
}
