export function saveImage(fileName="img",format="png"){
  let link = document.createElement("a")
  //var blob = new Blob([data],{type : 'image/'+format})
  //var url =  window.URL.createObjectURL(blob);
  //var blobURL = window.webkitURL.createObjectURL(blob);
  link.href = data
  link.download = fileName
  link.click()
}

export function domElementToImage(domElement,mimeType) {
  var srcImg, _aspectResize
  var mimeType = mimeType || 'image/png'

  if (!domElement) {
    throw new Error("Cannot Do screenshot without canvas domElement")
  }

  srcImg = domElement.toDataURL(mimeType)
  /*if(!width || !height){
    callback(srcImg)
  }else
  {
    aspectResize(srcImg, width, height, callback)
  }*/
  return srcImg
  
}


export function aspectResize(srcUrl, dstW, dstH, callback) {
  /* 
  resize an image to another resolution while preserving aspect
       
  @param {String} srcUrl the url of the image to resize
  @param {Number} dstWidth the destination width of the image
  @param {Number} dstHeight the destination height of the image
  @param {Number} callback the callback to notify once completed with callback(newImageUrl)
  */

  var cpuScaleAspect, img, onLoad
  cpuScaleAspect = function(maxW, maxH, curW, curH) {
    var ratio
    ratio = curH / curW
    if (curW >= maxW && ratio <= 1) {
      curW = maxW
      curH = maxW * ratio
    } else if (curH >= maxH) {
      curH = maxH
      curW = maxH / ratio
    }
    return {
      width: curW,
      height: curH
    }
  }

  onLoad = function() {
    var canvas, ctx, mimetype, newDataUrl, offsetX, offsetY, scaled
    canvas = document.createElement('canvas')
    canvas.width = dstW
    canvas.height = dstH
    ctx = canvas.getContext('2d')
    scaled = cpuScaleAspect(canvas.width, canvas.height, img.width, img.height)
    offsetX = (canvas.width - scaled.width) / 2
    offsetY = (canvas.height - scaled.height) / 2
    ctx.drawImage(img, offsetX, offsetY, scaled.width, scaled.height)
    mimetype = "image/png"
    newDataUrl = canvas.toDataURL(mimetype)
    callback(newDataUrl)
  }

  img = new Image()
  img.onload = onLoad
  img.src = srcUrl
}