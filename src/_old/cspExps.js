
var csp = require("js-csp");
let {chan, go, take, put,putAsync, alts, timeout} = require("js-csp");
var xducers = require("transducers.js");
var seq = xducers.seq
var transduce = xducers.transduce
var reduce    = xducers.reduce
let pipeline = csp.operations.pipeline;
let merge    = csp.operations.merge;


let meshesCh2 = glview.selectedMeshesCh;
    let xform = xducers.compose(
      xducers.filter( checkCount )//x => x.length>0)
      //xducers.partition(2)
    );

    let xTractEntities = xducers.compose(
        xducers.keep(),
        xducers.dedupe(),
        xducers.filter( filterEntities), //(x => x.userData && x.userData.entity ),
        xducers.map( fetchEntities )//x => x.userData.entity )
    );
    //pipeline( meshesCh2, xform, meshesCh2 );

    this.selectedEntities = [];
    let self = this;

    go(function*() {
      let prevSelections = []
      while(true) {
        var result = yield meshesCh2;
        let res  = seq(result,xTractEntities )
        

        prevSelections.map(function(entity){
          entity._selected = false;
        })

        res.map(function(entity){
          entity._selected = true;
        })
        self.selectedEntities = res;

        if( res.length >0 || prevSelections.length>0){
          console.log("I got entities",res)
          self._tempForceDataUpdate();
        }  

        prevSelections = res || [];
      }
    });

//////////////:
var csp = require("js-csp");
let {chan, go, take, put, alts, timeout} = require("js-csp");
var xducers = require("transducers.js");

this.selectedMeshesCh = chan();
