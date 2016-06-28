function saveToFile ({name, type, data}) {
  const text = data
  var a = document.createElement('a')
  var file = new Blob([text], {type})
  a.href = URL.createObjectURL(file)
  a.download = name
  a.click()
}

/* driver used to output a file that gets saved on the user's hdd (browser only)*/
export default function fileStorageDriver (outgoing$) {
  if (outgoing$) {
    outgoing$
      .forEach(saveToFile)
  }
}
