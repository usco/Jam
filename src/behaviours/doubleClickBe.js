  
let doubleClick = {
  attach:function( domNode ){
    this.domNode = domNode;

    //TODO: best way to add handlers?
    this.sClickHandler = undefined;
    this.dClickHandler = undefined;

    this.makeDoubleClick(this.sClickHandler, this.dClickHandler);
  }

  detach:function( ){

  }

  sClickHandler:function(event){
    if(this.sClickHandler) this.sClickHandler(event)
  }

  dClickHandler:function(event){
    if(this.dClickHandler) this.dClickHandler(event)
  }


  makeDoubleClick:function (doubleClickCallback, singleClickCallback) {
    return (function () {
        var clicks = 0,
            timeout;
        return function () {
            var me = this;
            clicks++;
            if (clicks == 1) {
                singleClickCallback && singleClickCallback.apply(me, arguments);
                timeout = setTimeout(function () {
                    clicks = 0;
                }, 400);
            } else {
                timeout && clearTimeout(timeout);
                doubleClickCallback && doubleClickCallback.apply(me, arguments);
                clicks = 0;
            }
        };
    }());
  }
}



/*function(el, onsingle, ondouble) {
    if (el.getAttribute("data-dblclick") == null) {
        el.setAttribute("data-dblclick", 1);
        setTimeout(function () {
            if (el.getAttribute("data-dblclick") == 1) {
                onsingle();
            }
            el.removeAttribute("data-dblclick");
        }, 300);
    } else {
        el.removeAttribute("data-dblclick");
        ondouble();
    }
}*/

export default doubleclick;