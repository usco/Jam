var fs    = require('fs')

export default function bufferToPng(buffer, width, height, depth, fileName){

  function genOutput(inBuf, width, height){
    let PNG = require('pngjs').PNG
    let png = new PNG( {width, height} )

    for (let i = 0; i < inBuf.length; ++i) {
      png.data[i] = inBuf[i]
    }
    png.pack().pipe(fs.createWriteStream(fileName))
  }

  //this is just a helper
  function log(inBuf, width, height){
    var channels = inBuf.length / 4
    for (var i = 0; i < channels; ++i) {
      var r = inBuf[i*4]
      var g = inBuf[i*4+1]
      var b = inBuf[i*4+2]
      var a = inBuf[i*4+3]

      console.log(r,g,b,a)
      console.log("//")
    }
  }

  genOutput(buffer, width, height)
}
