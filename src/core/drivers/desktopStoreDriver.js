import Rx from 'rx'
//let log = logger("desktop-store")
//log.setLevel("warn")

export default function makeDesktopDriver(){

  return function desktopDriver(request$){

    function read(data){
      const obs = new Rx.Subject()
      let reader = new FileReader()
      //log.debug("reading from " + data)

      function onLoad(e) {
        [e]
          .filter(e=>e!==null)
          .map(e=>e.target.result)
          .forEach(e=>( obs.onNext({response:e}) ))
      }

      function onProgress(e) {
        [e]
          .filter(e=>e.lengthComputable)
          .forEach(function(e){
            //log.debug("fetching percent", percentComplete)
            obs.onNext({progress: (e.loaded / e.total),total:e.total}) 
          })
      }

      function onError(error) {
        //log.error("error", error)
        obs.onError(error)
      }

      reader.onload = onLoad
      //reader.onloadend = onLoad
      reader.onprogress = onProgress
      reader.onerror = onError
      reader.readAsBinaryString(data)    
      return obs
    }

    function createResponse$(options){
      if(options.method === 'get'){
        return read(options.data)
      }
    }

    let response$$ = request$
      .map(reqOptions => {
        let response$ = createResponse$(reqOptions)
        response$.request = reqOptions
        return response$
      })
      .replay(null, 1)
    response$$.connect()

    return response$$

    /*return {
      read
    }*/    
  }

}
