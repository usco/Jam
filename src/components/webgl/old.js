  /*items$
    .debounce(200)
    .distinctUntilChanged(null, entityVisualComparer)
    .withLatestFrom( visualMappings$ ,function(items, mapper){
      return items
        .filter(exists)
        .map(mapper)
        .map(s=>s.take(1))
    })
    .do(clearScene)
    .flatMap(Rx.Observable.forkJoin)
    .subscribe(function(meshes){
      meshes.map(addMeshToScene)
    })*/
   
  /*items$
    .withLatestFrom( visualMappings$ ,function(items, mapper){
      console.log("visualMappings diff test",mapper, items)
     
      if(items){
        let obs = items.map(mapper).map(s=>s.take(1))
        Rx.Observable.forkJoin(obs)
          .bufferWithTimeOrCount(16,2)
          .subscribe(function(meshes){
            console.log("meshes",meshes)
        })
      }
    })
    .subscribe(e=>e)*/