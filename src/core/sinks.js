//////SINK!!! save changes to design
/*
design$
  .distinctUntilChanged()//only save if something ACTUALLY changed
  //.skip(1) // we don't care about the "initial" state
  .debounce(1000)
  //only save when design is set to persistent
  .filter(design=>design._persistent && (design.uri || design.name) && design._doSave)     
*/

//////////////////
//code related to saving etc
export function serializer(kernel, design$, entities$, annotations$, bom$, combos$, setDesignData$)
{

  //testing only
  design$
    .distinctUntilChanged()
    .skip(1)
    .subscribe(function(design){
      console.log("design changed",design)
      let jamLocalData = {
        persistent:design._persistent,
        lastDesignUri:design.uri,
        lastDesignName:design.name
      }
      localStorage.setItem("jam!-settings",JSON.stringify(jamLocalData) )
    })

  design$
    .map(design => ({persistent:design._persistent,uri:design.uri}) )
    .subscribe(function(persitenceInfo){
      let {persistent,uri} = persitenceInfo
      kernel.setDesignAsPersistent(persistent,uri)
    })

  design$
    .distinctUntilChanged()//only save if something ACTUALLY changed
    //.skip(1) // we don't care about the "initial" state
    .debounce(1000)
    //only save when design is set to persistent
    .filter(design=>design._persistent && (design.uri || design.name) && design._doSave)
    //staggered approach , do not save the first times
    //.bufferWithCount(2,1)
    //.map(value => value[1])
    .map(kernel.saveDesignMeta.bind(kernel))
    .subscribe(function(def){///issue : not purely a sink
      def.promise.then(function(result){
        //FIXME: hack for now
        console.log("save result",result)
        let serverResp =  JSON.parse(result)
        let persistentUri = kernel.dataApi.designsUri+"/"+serverResp.uuid

        setDesignData$({uri:persistentUri})
      })
    })

  //////SINK!!! save change to assemblies
  entities$
    .debounce(500)//don't save too often
    //only save when design is _persistent
    .onlyWhen(design$, design=>design._persistent && (design.uri || design.name) && design._doSave)
    .subscribe(function(entities){
      kernel.saveAssemblyState(entities.instances)
    })
  ///////////

  bom$
    .debounce(500)
    //only save when design is _persistent
    .onlyWhen(design$, design=>design._persistent && (design.uri || design.name) && design._doSave)
    .subscribe(function(bom){
      kernel.saveBom(bom.entries)
    })

  //////SINK!!! save change to assemblies
  annotations$
    .debounce(500)//don't save too often
    //only save when design is _persistent
    .onlyWhen(design$, design=>design._persistent)
    .subscribe(function (annotations){
      kernel.saveAnnotations(annotations)
    })

  //sink, for saving meshes
  combos$
    .skip(1)
    .distinctUntilChanged()
    .onlyWhen(design$, design=>design._persistent && (design.uri || design.name) && design._doSave)
    .subscribe(function(cb){
      kernel.dataApi.saveFile( cb.resource.name, cb.resource._file )
    })
}