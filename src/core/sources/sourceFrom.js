

function partSourceFromAddressbar(addressbar){
  return addressbar.get("sourceUrl")
}

function partSourceFromDnd(dnd$){
  //drag & drop sources
  let dndSourceFiles$  = dnd$.filter(e=>e.type ==="file").pluck("data").flatMap(fromArray)

  let dndSourceUris$    = dnd$.filter(e=> (e.type === "url") ).pluck("data").flatMap(fromArray)

  return merge(dndSourceFiles$, dndSourceUris$)
}
