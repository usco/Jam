import Rx from 'rx'
//let log = logger("desktop-store")
//log.setLevel("warn")

export default function makeDesktopDriver(){

  return function desktopDriver(request$){
    function read(uri){
      let obs = new Rx.Subject()
      let reader = new FileReader()
      //log.debug("reading from " + uri)

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
            obs.onNext({progress: (e.loaded / e.total),total:e.total} * 100) 
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
      reader.readAsBinaryString(uri)
      
      return obs
    }

    return {
      read
    }
    
  }

}
