 let glview   = this.refs.glview;
    let meshesCh = glview.selectedMeshesCh;
    
    
    let sum = function(a,b) { return a+b; };

    sum = function(a,b,c){
      let counter = 1;
      return function(a,b,c){
        console.log("a,b,c",a,b,c)
        counter++;
        return counter;
      }
      
    }

    let xform = xducers.compose(
        xducers.keep(),
        xducers.dedupe(),
        xducers.map(x => x+1),
        partitionMin(2)

        //xducers.partition(2)
        //xducers.cat()
        //xducers.compose( xducers.filter(x => x.length > 5), xducers.cat )
    );

    let testStuff = ["bla","bli",null, "bli", "drfd"];
    console.log( "before", testStuff)
    testStuff = seq(testStuff,xform);
    console.log( "after", testStuff)
    

    /*var t = require("transducers-js");
    var comp       = t.comp,
      map        = t.map,
      filter     = t.filter,
      transduce  = t.transduce;

    let xform = t.comp(
        xducers.keep(),
        xducers.dedupe(),
        t.map(x => x+1)
        //t.take(2)
    );

    let testStuff = ["bla","bli",null, "bli", "drfd"];
    console.log( "before", testStuff)
    testStuff = t.transduce(xform, sum(), "", testStuff);
    console.log( "after", testStuff)*/


    /*let testStuff2 = ["bla",null, undefined,null];
    console.log( "before2", testStuff2)
    testStuff2 = seq(testStuff2,xform);
    console.log( "after2", testStuff2)*/

    /*pipeline( meshesCh, xform, meshesCh );

    go(function*() {
      while(true) {
        var result = yield meshesCh;
        console.log("I got meshes",result)
      }
    });*/