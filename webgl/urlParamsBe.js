
import url from 'url'

var ParseUrlParamsBehaviour = {
  attach:function( domNode ){
    //TODO: best way to add handlers?
    this.dropHandler = undefined;

    this.fire('urlparams-found', {params:urlParams} );
        return urlParams;
        if(this.dropHandler) this.dropHandler({data:data, type:"text"});
    //let foo = url.parse("http://jam.youmagine.com/jam?designUrl=foobar&designUrl=baara",true);
  },
  detach:function(){
    this.domNode.removeEventListener("dragover", this.handleDragOver);
    this.domNode.removeEventListener("drop"    , this.handleDrop);
  },
};
  
export default ParseUrlParamsBehaviour;


