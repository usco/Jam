import Rx from 'rx'
const { merge } = Rx.Observable
import { combineLatestObj } from '../../utils/obsUtils'
import { mergeData } from '../../utils/modelUtils'
import { generateUUID } from '../../utils/utils'

export default function intent (DOM) {

  const entryTaps$ = DOM.select('.bom .normal').events('click', true) // capture == true
    .tap(e => e.stopPropagation())
    .map(e => e.currentTarget.dataset.id)

  const entryMultiTaps$ = entryTaps$
    .buffer(entryTaps$.debounce(250))
    .map(list => ({item: list[0], nb: list.length}))
    .shareReplay(10)

  const entryTapped$ = entryMultiTaps$
    .filter(data => data.nb === 1)
    .pluck('item')
    //.shareReplay(1)

  const entryDoubleTapped$ = entryMultiTaps$
    .filter(data => data.nb === 2)
    .pluck('item')
    .tap(e => console.log('entryDoubleTapped', e))
    //.shareReplay(1)


  const headerTapped$ = DOM.select('.headerCell').events('click', true)
    .tap(e => e.stopPropagation())

  const removeEntryRequest$ = DOM.select('.bom .removeBomEntry').events('click')
    .tap(e => e.stopPropagation())
    .map(function (e) {
      const actualTarget = e.currentTarget.dataset
      return {
        id: actualTarget.id
      }
    })

  const removeEntryRequestCancel$ = DOM.select('.bom .removal .cancel').events('click')
    .tap(e => e.stopPropagation())
    .map(function (e) {
      const actualTarget = e.currentTarget.dataset
      return {
        id: actualTarget.id
      }
    })

  const removeEntry$ = DOM.select('.bom .removal .confirm').events('click') // DOM.select('.bom .removeBomEntry').events('click')
    .tap(e => e.stopPropagation())
    .map(function (e) {
      const actualTarget = e.currentTarget.dataset
      return {
        id: actualTarget.id
      }
    })
    .share()

  const addEntryTapped$ = DOM.select('.addBomEntry').events('click')
    .tap(function (e) {
      e.preventDefault()
      return false
    })
    // .map(e=>getFormResults(e.target))

  const newEntryValues$ = combineLatestObj({
    name$: DOM.select('.bom .adder input[name="name"]').events('change')
      .map(e => e.target.value).startWith(''),
    qty$: DOM.select('.bom .adder input[name="qty"]').events('change')
      .map(e => e.target.value).startWith(0),
    phys_qty$: DOM.select('.bom .adder input[name="phys_qty"]').events('change')
      .map(e => e.target.value).startWith(0),
    unit$: DOM.select('.bom .adder select[name="unit"]').events('change')
      .map(e => e.target.value).startWith('EA'),
    printable$: DOM.select('.bom .adder [name="printable"]').events('change')
      .map(e => e.target.checked).startWith(false)
  })
    .merge(addEntryTapped$.map(({name: '', qty: 0, phys_qty: 0, unit: 'EA', printable: false})).delay(10)) // FIXME AWFULL HACK

  const addEntry$ = addEntryTapped$ // newEntryValues$
    .withLatestFrom(newEntryValues$, (_, data) => data)
    .filter(data => data.name !== '')
    .map(function (data) { // inject extra data
      return mergeData({}, data, {id: generateUUID()})
    })
    .share() // VERY important, you don't want duplicate uuid generation etc
    // .tap(e=>console.log("raw addEntry data",e))
    //  const addEntry$ = getFieldValues({name:'', qty:0, phys_qty:0, unit:'EA', printable:false}, DOM, '.bom .adder', addEntryTapped$)

  DOM.select('.textInput').events('keydown')
    .forEach(e => console.log('keydown', e))

  const changeEntryValue$ = DOM.select('.bom .normal input[type=text]').events('change')
    .merge(DOM.select('.bom .normal input[type=number]').events('change'))
    .tap(e => e.stopPropagation())
    .tap(function (e) {
      e.preventDefault()
      return false
    })
    .map(function (e) {
      const actualTarget = e.currentTarget.parentElement.dataset
      return {
        id: actualTarget.id,
        attrName: actualTarget.name,
        value: e.target.value
      }
    })

  const checkEntry$ = DOM.select('.bom .normal input[type=checkbox]').events('change')
    .tap(e => e.stopPropagation())
    .map(function (e) {
      const actualTarget = e.currentTarget.parentElement.dataset
      return {
        id: actualTarget.id,
        attrName: actualTarget.name,
        value: e.target.checked
      }
    })

  const entryOptionChange$ = DOM.select('.bom .normal select').events('change')
    .do(e => e.stopPropagation())
    .map(function (e) {
      const actualTarget = e.currentTarget.parentElement.dataset
      return {
        id: actualTarget.id,
        attrName: actualTarget.name,
        value: e.target.value
      }
    })

  const editEntry$ = merge(
    changeEntryValue$
    , checkEntry$
    , entryOptionChange$
  )

  const toggle$ = DOM.select('.bomToggler')
    .events('click') // toggle should be scoped?
    .map(true)
    .scan((acc, val) => !acc, false) // intitial value of scan needs to match the one of "startWith" in "toggled" model

  const exportAsJson$ = DOM.select('.bom-as-json')
    .events('click')
    .tap(e=>console.log('exportAsJson'))

  const exportAsText$ = DOM.select('.bom-as-text')
    .events('click')
    .tap(e=>console.log('exportAsText'))

  return {
    entryTapped$,
    entryDoubleTapped$,
    headerTapped$,

    addEntry$,
    editEntry$,
    removeEntryRequest$,
    removeEntryRequestCancel$,
    removeEntry$,

    exportAsJson$,
    exportAsText$,

    toggle$
  }
}
