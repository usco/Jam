import {exists} from './utils'


function makeAssetManager(drivers){

}


function isValidFile(file){
  return (typeof File !== "undefined" && File !== null) && file instanceof File))
}

function load(fileUri, options){
  const defaults = {
    parentUri   :undefined
    ,transient  :false
    ,keepRawData:false
    ,parse      :true

    ,fetchOptions:{}
    ,parseOptions:{}
  }
  options = mergeData(options,defaults)


  input
    .filter(exists)


  //
  if (fileUri == null) {
    error = "Invalid file name : " + fileUri

  }

  input
    .filter(isValidFile)
    .map(function(){
      //we have been given a file , or file like structure, default store to desktop ?
      [storeName,filename] = ["desktop", fileUri.name]
      file = fileUri
      _file = fileUri
      fileUri = fileUri.name
    })

  input
    .filter(!isValidFile)
    .map(function(){
      fileUri = pathUtils.toAbsoluteUri(fileUri, parentUri)
      [storeName,filename] = pathUtils.parseFileUri(fileUri, parentUri)
    })
    

  log.info("Attempting to load :", filename, "from store:", storeName)

  let resource = {
    ext:"foo"
    ,file:_file//FIXME a bit of a hack: for future uploads we keep the original file?
  }


  //the resource was already loaded, return it 
  if (filename in this.assetCache){
    log.info("resource already in cache, returning cached version")
    resource = this.assetCache[filename]
    return resource
  }

  //not cached 
  store = this.stores[storeName]
  if (!store) {
    error = new Error("No store named " + storeName)
    error.name = "storeNotFoundError"
  }
  
  //get parser instance , if it exists
  parser = this.parsers[extension]
  if (!parser) {
    error = new Error("No parser found for '" + extension + "' file format")
    error.name = "parserNotFoundError"
  }



  //if extension not in @codeExtensions
  //get prefered input data type for parser/extension
  //FIXME: do this more elegantly 

  fileOrFileName = storeName === "desktop" ? file : filename//if desktop, then file, else fileName
  
  function getRawData(){
    //get raw data (not parsed)
    //returns observable
    return store.read(fileOrFileName, {
      dataType: parser.inputDataType
    })
  }   

  function parseRawData(rawData){
    //returns observable
    return parser.parse(loadedResource, parseOptions)
  }

  function onSuccess(loadedResource) 
    resource.fetched = true

    obs.onNext({
      parsing:0
    })
   
    resource.rawData = keepRawData ? loadedResource : null
    resource.data = loadedResource
    resource.loaded = true
    if (!transient) {
      assetCache[fileUri] = resource
    }
  }
                      
  function onProgress = function(progress) {
    log.debug("got some progress", JSON.stringify(progress))
    if ("fetching" in progress) {
      resource.fetchProgress = progress.fetching
    }
    if ("parsing" in progress) {
      resource.parseProgress = progress.parsing
    }
    deferred.notify(progress)
    resource.size = progress.total
  }

  function onError( error ){
    log.error("failure in data reading step", error)
    error = new Error(error.message)
    fetchError.name = "fetchError"
  }

  //load raw data from uri/file, get an observable
  rawDataDeferred.promise.then( onSuccess, onError, onProgress)
  
  return obs

}





/** 
   * fileUri : path to the file, starting with the node prefix
   * options: object : additionnal options for loading resource
   *  options.parentUri : string : not sure we should have this here : for relative path resolution
   *  options.transient : boolean : if true, don't store the resource in cache, defaultfalse
   *  options.keepRawData: boolean: if true, keep a copy of the original data (un-parsed)
   *  options.noParse: boolean: if true, do not attempt to parse the raw data
   * 
   * If no store is specified, file paths are expected to be relative
   */
  load(fileUri, options) {
    //TODO: cleann this all up
    //load resource, store it in resource map, return it for use
  }