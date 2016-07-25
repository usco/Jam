import test from 'ava'
import Rx from 'rx'
const never = Rx.Observable.never
const of = Rx.Observable.of

import { extractMeshSources, extractSourceSources } from './dataSourceExtractors'

test.cb('mesh source extractors: can extract mesh sources from input raw addressbar sources', t => {
  const dnd$ = never()
  const postMessage = never()
  const addressbar = {
    get: function () {
      return of(['fakeModel.stl'])
    }
  }

  let meshSource$ = extractMeshSources({dnd$, postMessage, addressbar})

  meshSource$.forEach(function (meshSource) {
    t.deepEqual(meshSource[0], 'fakeModel.stl')
    t.end()
  })
})

test.cb('mesh source extractors: can extract mesh sources from input raw postMessage sources', t => {
  const dnd$ = never()
  const postMessage = of({data: {modelUrl: 'fakeModel.stl'}})
  const addressbar = {get: () => never()}

  let meshSource$ = extractMeshSources({dnd$, postMessage, addressbar})

  meshSource$.forEach(function (meshSource) {
    t.deepEqual(meshSource[0], 'fakeModel.stl')
    t.end()
  })
})

test.cb('mesh source extractors: can extract mesh sources from input raw dragAnddrop sources', t => {
  const dnd$ = of({type: 'url', data: ['fakeModel.stl']})
  const postMessage = never()
  const addressbar = {get: () => never()}

  let meshSource$ = extractMeshSources({dnd$, postMessage, addressbar})

  meshSource$.forEach(function (meshSource) {
    t.deepEqual(meshSource[0], 'fakeModel.stl')
    t.end()
  })
})

/* it("should handle different data types passed by sources gracefully(html5 File)", function(done) {

  const dnd$          = never()
  const postMessages$ = of({modelUrl:{foo:e=>e,bar:e=>e}})
  const addressbar    = {get:()=>never()}

  let meshSource$ = extractMeshSources({dnd$,postMessages$,addressbar})

  meshSource$.forEach(function(meshSource){
    t.deepEqual(meshSource[0],"fakeModel.stl")
    t.end()
  })
})*/

test.cb('mesh source extractors: should filter out invalid data', t => {
  //this.timeout(3000)

  const dnd$ = of({type: 'url', data: [undefined, '']})
  const postMessage = of({data: {modelUrl: ''}})
  const addressbar = {get: () => of([undefined])}

  let meshSource$ = extractMeshSources({dnd$, postMessage, addressbar})

  setTimeout(t.end, 1500)

  meshSource$.forEach(function (meshSource) {
    t.fail(meshSource, undefined, 'data should have been fitered out')
    t.end()
  })
})
