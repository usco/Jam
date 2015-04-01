
//prevents scrolling whole page if using scroll & mouse is within target dom node
var PreventScrollBehaviour = {
  attach:function( domNode ){
    domNode.addEventListener("mousewheel"    , this.scrollHandler, false);
    domNode.addEventListener("DOMMouseScroll", this.scrollHandler, false);
    domNode.addEventListener("wheel"         , this.scrollHandler, false);
    this.domNode = domNode;
  },
  detach:function(){
    this.domNode.removeEventListener("mousewheel", this.scrollHandler);
    this.domNode.removeEventListener("DOMMouseScroll"    , this.scrollHandler);
  },
 
  scrollHandler:function (event)
  {
      event.preventDefault();
      return false;
  },

}
export default PreventScrollBehaviour;
