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
  .merge(
    DOM.select('.fallbackPickerSquare')
    .events('click').map(e => e.target.dataset.color))

  /*const baseStream$ = merge(
      DOM.select('.transformsInput').events('change'),
      DOM.select('.transformsInput').events('blur'),
      DOM.select('.transformsInput').events('input'),

      //special one for scaling
      DOM.select('.transformsInputPercent').events('change'),
      DOM.select('.transformsInputPercent').events('blur'),
      DOM.select('.transformsInputPercent').events('input')
  )
  .map(function (e) {
    let val = parseFloat(e.target.value)
    const attributes = e.target.dataset
    let dtrans = attributes.transform
    let [trans, idx, extra] = dtrans.split('_')
    if (trans === 'rot') { // convert rotated values back from degrees to radians
      val = toRadian(val)
    }

    if(trans === 'sca') {
      if(extra === 'percent'){
        val = val / 100
        console.log('scale',val, extra)
      }
      else{
        return undefined
      }
    }
    if(trans === 'pos') {
      //we are dealing with offsets, NOT absolute positions
    }
    console.log('there', val, idx)
    return {val, trans, idx: parseInt(idx, 10)}
  })
  .filter(exists)
  .filter(data => isNumber(data.val))

  const changeTransforms$ = baseStream$
    .bufferWithCount(2,1)
    .map(function(buffer){
      const [first, second] = buffer
      return {val: second.val - first.val, trans: second.trans, idx: second.idx}
    })
    .merge(baseStream$.take(1))
    .tap(function(acc){
      console.log('changeTransformsDiff',acc)
    })*/

    const changeBounds$ = merge(
      DOM.select('.absScaling').events('change'),
      DOM.select('.absScaling').events('blur'),
      DOM.select('.absScaling').events('input')
    )
    .map(function(e){
      let val = parseFloat(e.target.value)
      const attributes = e.target.dataset
      //console.log('attributes', attributes)
      let dtrans = attributes.transform
      let [trans, idx, extra] = dtrans.split('_')
      return {val, idx: parseInt(idx, 10)}
    })
    //.tap(e=>console.log('changeBounds',e))

    const changeTransforms$ = merge(
    DOM.select('.transformsInput').events('change'),
    DOM.select('.transformsInput').events('blur'),
    DOM.select('.transformsInput').events('input'),

    //special one for scaling
    DOM.select('.transformsInputPercent').events('change'),
    DOM.select('.transformsInputPercent').events('blur'),
    DOM.select('.transformsInputPercent').events('input')
  )
    .map(function (e) {
      let val = parseFloat(e.target.value)
      const attributes = e.target.dataset
      //console.log('attributes', attributes)
      let dtrans = attributes.transform
      let [trans, idx, extra] = dtrans.split('_')
      if (trans === 'rot') { // convert rotated values back from degrees to radians
        val = toRadian(val)
      }

      if(trans === 'sca') {
        if(extra === 'percent'){
          val = val / 100
          //console.log('scale',val, extra)
        }
        else{
          return undefined
        }
      }
      if(trans === 'pos') {
        //we are dealing with offsets, NOT absolute positions
      }
      //console.log('there', val, idx)

      return {val, trans, idx: parseInt(idx, 10)}
      //return {}
    })
    .filter(exists)
    .filter(data => isNumber(data.val))
    .distinctUntilChanged()
    // .debounce(20)
    .shareReplay(1)

    //output[changed.trans][changed.idx] = changed.val

  const changeMeta$ = merge(
    changeName$.map(function (value) { return {name: value} })
    , changeColor$.map(function (value) { return {color: value} })
  )

  const resetScaling$ = DOM.select('.resetScaling').events('click')

  return {
    changeMeta$,
    changeTransforms$,
    resetScaling$,
    changeBounds$
  }
}
