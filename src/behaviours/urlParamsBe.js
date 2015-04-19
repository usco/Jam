
import url from 'url'
import Rx from 'rx'

var ParseUrlParamsBehaviour = {
  attach:function( domNode ){
    //TODO: best way to add handlers?
    this.dropHandler = undefined;

    //"http://jam.youmagine.com/jam?designUrl=foobar&designUrl=baara"
    let targetUrl = window.location;
    let params = url.parse(targetUrl,true);

    //let outCh = new Rx.Subject();
    //outCh.onNext(params);
  },
  detach:function(){
  },
  fetch:function(paramName){
    let targetUrl = window.location.href;
    let params = url.parse(targetUrl, true);
    let result = params.query;
    //TODO: always return query
    if(paramName in result) return [].concat( result[paramName] )
    return []
  }

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