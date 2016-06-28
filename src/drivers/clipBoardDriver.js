function saveToClipBoard ({data}) {
  function selectElementText (element) {
    if (document.selection) {
      let range = document.body.createTextRange()
      range.moveToElementText(element)
      range.select()
    } else if (window.getSelection) {
      let range = document.createRange()
      range.selectNode(element)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
    }
  }

  let element = document.createElement('DIV')
  element.textContent = data
  document.body.appendChild(element)
  selectElementText(element)
  document.execCommand('copy')
  element.remove()
}

/* driver used to output data to clipBoard  (browser only)*/
export default function clipBoardDriver (outgoing$) {
  if (outgoing$) {
    outgoing$
      .forEach(saveToClipBoard)
  }
}
