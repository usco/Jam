
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


/*  urlParamsFoundHandler:function( event ){
    var urlParams = event.detail.params;
    if("meshUri" in urlParams)
    {
      for( var i=0;i<urlParams["meshUri"].length;i++)
      {
        this.loadMesh(urlParams["meshUri"][i],{display:true});
      }
    }
    //FIXME:should be either or
    if("designUri" in urlParams){
      //TODO: split it out
      this.loadDesign( urlParams[ "designUri" ][0] );
    }
  },
  urlDroppedHandler:function( event ){
    //console.log("urlDroppedHandler",event);
    this.loadMesh( event.detail.data );
  },*/