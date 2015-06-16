//////SINK!!! save changes to design
design$
  .distinctUntilChanged()//only save if something ACTUALLY changed
  //.skip(1) // we don't care about the "initial" state
  .debounce(1000)
  //only save when design is set to persistent
  .filter(design=>design._persistent && (design.uri || design.name) && design._doSave)


design$
  .distinctUntilChanged()//only save if something ACTUALLY changed
  //.skip(1) // we don't care about the "initial" state
  .debounce(1000)
  //only save when design is set to persistent
  .filter(design=>design._persistent && (design.uri || design.name) && design._doSave)
  //staggered approach , do not save the first times
  .bufferWithCount(2,1)
  .map(value => value[1])
  .map(self.kernel.saveDesignMeta.bind(self.kernel))
  .subscribe(function(def){
    def.promise.then(function(result){
      //FIXME: hack for now
      console.log("save result",result)
      let serverResp =  JSON.parse(result)
      let persistentUri = self.kernel.dataApi.designsUri+"/"+serverResp.uuid

      localStorage.setItem("jam!-lastDesignUri",persistentUri)
      setDesignData$({uri:persistentUri})
    })
  })
  /*.subscribe(function(res){
    console.log("experimental save result",res)
  })*/      



design$
  .pluck("_persistent")
  //seperation of "sinks" from the rest
  .subscribe(function(value){
    localStorage.setItem("jam!-persistent",value)
    if(value) self.kernel.setDesignAsPersistent(true)
  })


//////SINK!!! save change to assemblies
entities$
  .debounce(500)//don't save too often
  //only save when design is _persistent
  .onlyWhen(design$, design=>design._persistent && (design.uri || design.name) && design._doSave)
  .subscribe(function(entities){
    console.log("GNO")
    self.kernel.saveBom()//TODO: should not be conflated with assembly
    self.kernel.saveAssemblyState(entities.instances)
  })
///////////

//////SINK!!! save change to assemblies
annotations$
  .debounce(500)//don't save too often
  //only save when design is _persistent
  .onlyWhen(design$, design=>design._persistent)
  .subscribe(function (annotations){
    self.kernel.saveAnnotations(annotations)
  })


//sink, for saving meshes
combos$
  .skip(1)
  .distinctUntilChanged()
  .onlyWhen(design$, design=>design._persistent && (design.uri || design.name) && design._doSave)
  .subscribe(function(cb){
    console.log("saving mesh")
    self.kernel.dataApi.saveFile( cb.resource.name, cb.resource._file )
  })