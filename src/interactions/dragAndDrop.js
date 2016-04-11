import Rx from 'rx'
let Observable = Rx.Observable
let fromEvent = Observable.fromEvent

import { preventDefault, isTextNotEmpty, formatData, exists } from '../utils/obsUtils'

// drag & drop behaviour from dom element
export function observableDomDragAndDrop (targetEl) {
  let dragOvers$ = fromEvent(targetEl, 'dragover')
  let drops$ = fromEvent(targetEl, 'drop')

  drops$.subscribe(preventDefault)
  dragOvers$.subscribe(preventDefault)

  drops$
    .share()

  let urls$ = drops$
    .map((event) => event.dataTransfer.getData('url'))
    .filter(isTextNotEmpty)
    .map((data) => formatData([data], 'url'))

  let texts$ = drops$
    .map((event) => event.dataTransfer.getData('Text'))
    .filter(isTextNotEmpty)
    .map((data) => formatData([data], 'text'))

  let files$ = drops$
    .map((event) => event.dataTransfer.files)
    .filter(exists)
    .map((data) => [].slice.call(data))
    .map((data) => formatData(data, 'file'))

  return Observable.merge(
    urls$,
    texts$,
    files$
  )
}

// drag & drop behaviour
export function observableDragAndDrop_old (targetEl, root) {
  function fromCEvent (targetEl, eventName) {
    return root.get(targetEl, eventName)
  }

  let dragOvers$ = fromCEvent(targetEl, 'dragover')
  let drops$ = fromCEvent(targetEl, 'drop')

  drops$.subscribe(preventDefault)
  dragOvers$.subscribe(preventDefault)

  drops$
    .share()

  let urls$ = drops$
    .map((event) => event.dataTransfer.getData('url'))
    .filter(isTextNotEmpty)
    .map((data) => formatData([data], 'url'))

  let texts$ = drops$
    .map((event) => event.dataTransfer.getData('Text'))
    .filter(isTextNotEmpty)
    .map((data) => formatData([data], 'text'))

  let files$ = drops$
    .map((event) => event.dataTransfer.files)
    .filter(exists)
    .map((data) => [].slice.call(data))
    .map((data) => formatData(data, 'file'))

  return Observable.merge(
    urls$,
    texts$,
    files$
  )
}

export function observableDragAndDrop (dragOvers$, drops$) {
  /* let dragOvers$  = fromCEvent(targetEl, 'dragover')
  let drops$      = fromCEvent(targetEl, 'drop')*/

  drops$.subscribe(preventDefault)
  dragOvers$.subscribe(preventDefault)

  drops$
    .share()

  let urls$ = drops$
    .map((event) => event.dataTransfer.getData('url'))
    .filter(isTextNotEmpty)
    .map((data) => formatData([data], 'url'))

  let texts$ = drops$
    .map((event) => event.dataTransfer.getData('Text'))
    .filter(isTextNotEmpty)
    .map((data) => formatData([data], 'text'))

  let files$ = drops$
    .map((event) => event.dataTransfer.files)
    .filter(exists)
    .map((data) => [].slice.call(data))
    .map((data) => formatData(data, 'file'))

  return Observable.merge(
    urls$,
    texts$,
    files$
  )
}
