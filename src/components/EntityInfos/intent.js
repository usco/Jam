import Rx from 'rx'
let merge = Rx.Observable.merge
import { toRadian } from '../../utils/formatters'
import { exists } from '../../utils/utils'

function isNumber (obj) { return !isNaN(parseFloat(obj)) }

export default function intent (DOM) {
  // const addComment$ = DOM.select('.comments').events('addComment$').pluck('detail')

  const changeName$ = merge(
    DOM.select('.nameInput').events('change')
    , DOM.select('.nameInput').events('input')
  ).map(e => e.target.value)
    .distinctUntilChanged()
    .debounce(20)
    .shareReplay(1)

  const changeColor$ = merge(
    DOM.select('.colorInput').events('change')
    , DOM.select('.colorInput').events('input')
  ).map(e => e.target.value)
    .distinctUntilChanged()
    .debounce(20)
    .shareReplay(1)


  const changeTransforms$ = merge(
    DOM.select('.transformsInput').events('change'),
    //DOM.select('.transformsInput').events('blur').share()
   DOM.select('.transformsInput').events('input')
  )
    .map(function (e) {
      console.log('here', e)
      let val = parseFloat(e.target.value)
      let dtrans = e.target.attributes['data-transform'].value
      let [trans, idx] = dtrans.split('_')
      if (trans === 'rot') { // convert rotated values back from degrees to radians
        val = toRadian(val)
      }
      if(trans === 'sca') {
        val = val / 100
      }
      console.log('there', val, idx)

      return {val, trans, idx: parseInt(idx, 10)}
    })
    .filter(exists)
    .filter(data => isNumber(data.val))
    .distinctUntilChanged()
    // .debounce(20)
    .shareReplay(1)

  const changeMeta$ = merge(
    changeName$.map(function (value) { return {name: value} })
    , changeColor$.map(function (value) { return {color: value} })
  )

  return {
    changeMeta$,
    changeTransforms$
  }
}
