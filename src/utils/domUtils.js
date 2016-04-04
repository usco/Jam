import { combineLatestObj } from './obsUtils'

export function getFormResults (formElement) {
  var formElements = formElement.elements
  // var formParams = {}
  var i = 0

  /*
  var elem = null
  for (i = 0; i < formElements.length; i += 1) {
      elem = formElements[i]
      switch (elem.type) {
          case 'submit':
              break
          case 'radio':
              if (elem.checked) {
                  formParams[elem.id] = elem.value
              }
              break
          case 'checkbox':
              if (elem.checked) {
                  formParams[elem.id] = false //setOrPush(formParams[elem.name], elem.value)
              }
              break
          default:
              formParams[elem.id] = elem.value//setOrPush(formParams[elem.name], elem.value)
      }
  }*/
  var elements = []
  for (i = 0; i < formElements.length; i++) {
    elements[i] = formElements[i]
  }
  var formParams = elements.reduce(function (result, elem) {
    const key = elem.id || elem.name || elem.className || 'foo'
    // console.log("key",key, elem.type)
    switch (elem.type) {
      case 'submit':
        break
      case 'radio':
        if (elem.checked) {
          result[key] = elem.value
        }
        break
      case 'checkbox':
        if (elem.checked) {
          result[key] = false // setOrPush(formParams[elem.name], elem.value)
        }
        break
      case 'text':
        result[key] = elem.value
        break
      case 'number':
        result[key] = elem.value
        break
      case 'password':
        result[key] = elem.value
        break
      case 'select-one':
        result[key] = elem.value
        break
      case 'textarea':
        result[key] = elem.value
        break
    // default:
    //  result[key] = elem.value//setOrPush(formParams[elem.name], elem.value)
    }
    return result
  }, {})

  // console.log("formParams",formParams)
  return formParams
}

export function getFieldValues (defaults, DOM, baseSelector, trigger$) {
  const fields = Object.keys(defaults)
    .reduce(function (fields, key) {
      fields[key] = DOM.select(`${baseSelector} input[name="${key}"]`)
        .events('change')
        .map(function (e) {
          return (defaults[key] === false || defaults[key] === true) ? e.target.checked : e.target.value
        })
        // .map(e=> hasOwnProperty(e.target) || e.target.value )
        .startWith(defaults[key])

      return fields
    }, {})

  return combineLatestObj(fields).tap(e => console.log('fields', e))
    .sample(trigger$)
}
