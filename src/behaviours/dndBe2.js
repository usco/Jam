
let DndBehaviour = {
  attach:function( domNode ){
    domNode.addEventListener("dragover", this.handleDragOver.bind(this), false);
    domNode.addEventListener("drop", this.handleDrop.bind(this), false);
    this.domNode = domNode;

    //TODO: best way to add handlers?
    this.dropHandler = undefined;


    let obs = Rx.Observable.create(function (observer) {
    observer.onNext(42);
    observer.onCompleted();

    // Note that this is optional, you do not have to return this if you require no cleanup
    return function () {
        console.log('disposed');
    };
});

    return Rx.Observable

  },
  detach:function(){
    this.domNode.removeEventListener("dragover", this.handleDragOver);
    this.domNode.removeEventListener("drop"    , this.handleDrop);
  },
  handleDragOver:function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
  },
  handleDrop:function(e)
  {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'copy'; 
    //console.log("e",e,e.dataTransfer)
    var data = e.dataTransfer.getData("url");
    if( data!= "")
    {
      console.log("url-dropped")
      //this.asyncFire('url-dropped', {data:data} );
      if(this.dropHandler) this.dropHandler({data:[data], type:"url"})
      return;
    }
    
    var data=e.dataTransfer.getData("Text");
    if( data!= "" ){
        console.log("text-dropped")
        //this.asyncFire('text-dropped', {data:data} );
        if(this.dropHandler) this.dropHandler({data:[data], type:"text"})
        return;
    }

    var files = e.dataTransfer.files;
    if(files)
    {
      console.log("files-dropped")
      //this.asyncFire('files-dropped', {data:files});
      if(this.dropHandler) this.dropHandler({data:files, type:"files"})
      return;
    }
  }
};
  
export default DndBehaviour;