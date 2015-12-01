import assert from 'assert'
import Rx from 'rx'
const never = Rx.Observable.never
const of  =  Rx.Observable.of

import {extractMeshSources,extractSourceSources} from './dataSourceExtractors'

describe("mesh source extractors", function() {
  
  it("can extract mesh sources from input raw addressbar sources", function(done) {
    
    const dnd$          = never()
    const postMessages$ = never()
    const addressbar    = { 
      get:function(){
        return of(["fakeModel.stl"])
      }
    }
        
    let meshSource$ = extractMeshSources({dnd$,postMessages$,addressbar})

    meshSource$.forEach(function(meshSource){
      assert.strictEqual(meshSource[0],"fakeModel.stl")
      done()
    })
  })


  it("can extract mesh sources from input raw postMessage sources", function(done) {
    
    const dnd$          = never()
    const postMessages$ = of({modelUrl:"fakeModel.stl"})
    const addressbar    = {get:()=>never()}
  
    let meshSource$ = extractMeshSources({dnd$,postMessages$,addressbar})

    meshSource$.forEach(function(meshSource){
      assert.strictEqual(meshSource[0],"fakeModel.stl")
      done()
    })
  })

  it("can extract mesh sources from input raw dragAnddrop sources", function(done) {
    
    const dnd$          = of({type:"url", data:["fakeModel.stl"]})
    const postMessages$ = never()
    const addressbar    = {get:()=>never()}
  
    let meshSource$ = extractMeshSources({dnd$,postMessages$,addressbar})

    meshSource$.forEach(function(meshSource){
      assert.strictEqual(meshSource[0],"fakeModel.stl")
      done()
    })
  })


  it("should filter out invalid data", function(done) {
    this.timeout(3000)

    const dnd$          = of({type:"url", data:[undefined, ""]})
    const postMessages$ = of({modelUrl:""})
    const addressbar    = {get:()=>of([undefined])}
  
    let meshSource$ = extractMeshSources({dnd$,postMessages$,addressbar})

    setTimeout(done, 1500)

    meshSource$.forEach(function(meshSource){
      assert.fail(meshSource, undefined, "data should have been fitered out")
      done()
    })

  })

})