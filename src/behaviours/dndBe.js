let DndBehaviour = {
  attach:function( domNode ){
    domNode.addEventListener("dragover", this.handleDragOver.bind(this), false)
    domNode.addEventListener("drop", this.handleDrop.bind(this), false)
    this.domNode = domNode

    //TODO: best way to add handlers?
    this.dropHandler = undefined
  },
  detach:function(){
    this.domNode.removeEventListener("dragover", this.handleDragOver)
    this.domNode.removeEventListener("drop"    , this.handleDrop)
  },
  handleDragOver:function(e) {
    if (e.preventDefault) {
      e.preventDefault()
    }
  },
  handleDrop:function(e)
  {
    if (e.preventDefault) {
      e.preventDefault() // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'copy' 
    //console.log("e",e,e.dataTransfer)
    var data = e.dataTransfer.getData("url")
    if( data!= "")
    {
      console.log("url-dropped")
      //this.asyncFire('url-dropped', {data:data} )
      if(this.dropHandler) this.dropHandler({data:[data], type:"url"})
      return
    }
    
    var data=e.dataTransfer.getData("Text")
    if( data!= "" ){
        console.log("text-dropped")
        //this.asyncFire('text-dropped', {data:data} )
        if(this.dropHandler) this.dropHandler({data:[data], type:"text"})
        return
    }

    var files = e.dataTransfer.files
    if(files)
    {
      console.log("files-dropped")
      //this.asyncFire('files-dropped', {data:files})
      if(this.dropHandler) this.dropHandler({data:( [].slice.call(files) ), type:"files"})
      return
    }
  }
}
  
export default DndBehaviour