var csp = require("js-csp");

let {chan, go, take, put, alts} = require("js-csp");
let ch = chan()

/*go( function*(){
  while(true) {
    console.log("tak", yield take(ch))
  }
});

go( function*(){
  yield put( ch, 'a');
  yield put( ch, 3);

});*/


/*
//BASIC implementation
class SpecialActionDispatcher{

  constructor(){
    this.ch = chan()

  }
  actionOne(){
    let ch = this.ch
     go( function*(){
        yield put( ch, {data:"some text",type:"foo"});
      });
  }
  actionTwo(){
    let ch = this.ch
     go( function*(){
        yield put( ch, {data:{id:0,title:"cool"},type:"bomAdd"});
      });
  }
}

let actDisp = new SpecialActionDispatcher()

//somewhere else
go( function*(){
  while(true) {
    let act =  yield take(actDisp.ch);
    console.log("tak",act);

    switch( act.type ){
      case "bomAdd":
        console.log("add to bom", act.data);
      break;
    }
  }
});

actDisp.actionOne()
actDisp.actionTwo()*/


//Another variant

class ActionOne{
  constructor(){
    this.ch = chan()
  }
  execute(){
    csp.putAsync(this.ch, {data:{id:0,title:"cool"},type:"bomAdd"});
  }
}

let act1 = new ActionOne();

//somewhere else

go(function*() {
  //var mousech = listen(trackerEl, 'mousemove');
  //var clickch = listen(trackerEl, 'click');
  var act1Ch =  act1.ch;
  //var r = yield alts([cancel, timeout(500)]);
  while(true) {
    var v = yield alts([act1Ch]);
    let {channel, value } = v;

    switch(channel){
      case act1Ch:
        console.log("actionOne");
        var t = value.type;
        console.log(value,t)
      break;
    }
   
  } 
});

//somewhere else
act1.execute()




/*function* player(name, table) {
  while (true) {
    var ball = yield csp.take(table);
    if (ball === csp.CLOSED) {
      console.log(name + ": table's gone");
      return;
    }
    ball.hits += 1;
    console.log(name + " " + ball.hits);
    yield csp.timeout(100);
    yield csp.put(table, ball);
  }
}

csp.go(function* () {
  var table = csp.chan();

  csp.go(player, ["ping", table]);
  csp.go(player, ["pong", table]);

  yield csp.put(table, {hits: 0});
  yield csp.timeout(1000);
  table.close();
});*/


export default "qsdf"