
import {selectEntities$,addEntityInstances$, updateEntities$, deleteEntities$, duplicateEntities$, deleteAllEntities$ } from './actions/entityActions'


function models () {
  let entities = require("./entityModel")

  let intent = {
    //createEntityInstance$:new Rx.Subject(),//createEntityInstance$,
    addEntities$:addEntityInstances$,
    updateEntities$, 
    deleteEntities$, 
    duplicateEntities$, 
    deleteAllEntities$,
    selectEntities$,

    newDesign$
  }

  let entities$ = entities(intent)


  /*let annotations = require("./annotationModel")

  let annotations$ = annotations({
        singleTaps$:glview.singleTaps$, 
        activeTool$:appState$.map(aS=>aS.activeTool),
        addAnnotations$:addAnnotations$,
        deleteAnnots$:deleteEntities$
      },
      self.state.annotationsData
    ).share()*/

  //annotations$
  //  .subscribe( ()=>clearActiveTool$() )


  //register meshes <=> bom entries
  /*let bom = require('./bomReg')
  
  let bom$ = bom({
      addBomEntries$:addBomEntries$,
      combos$:combos$,
      partTypes$:partTypes$,
      entities$:entities$,
      selectBomEntries$:selectBomEntries$,
      selectBomEntries2$:selectBomEntries2$
    })*/

}

  