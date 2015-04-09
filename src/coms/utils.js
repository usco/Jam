// basic protocol helpers

var symbolExists = typeof Symbol !== 'undefined';

var protocols = {
  iterator: symbolExists ? Symbol.iterator : '@@iterator',
  transformer: symbolExists ? Symbol('transformer') : '@@transformer'
};

function throwProtocolError(name, coll) {
  throw new Error("don't know how to " + name + " collection: " +
                  coll);
}

function fulfillsProtocol(obj, name) {
  if(name === 'iterator') {
    // Accept ill-formed iterators that don't conform to the
    // protocol by accepting just next()
    return obj[protocols.iterator] || obj.next;
  }

  return obj[protocols[name]];
}

function getProtocolProperty(obj, name) {
  return obj[protocols[name]];
}

function iterator(coll) {
  var iter = getProtocolProperty(coll, 'iterator');
  if(iter) {
    return iter.call(coll);
  }
  else if(coll.next) {
    // Basic duck typing to accept an ill-formed iterator that doesn't
    // conform to the iterator protocol (all iterators should have the
    // @@iterator method and return themselves, but some engines don't
    // have that on generators like older v8)
    return coll;
  }
  else if(isArray(coll)) {
    return new ArrayIterator(coll);
  }
  else if(isObject(coll)) {
    return new ObjectIterator(coll);
  }
}

function ArrayIterator(arr) {
  this.arr = arr;
  this.index = 0;
}

ArrayIterator.prototype.next = function() {
  if(this.index < this.arr.length) {
    return {
      value: this.arr[this.index++],
      done: false
    };
  }
  return {
    done: true
  }
};

function ObjectIterator(obj) {
  this.obj = obj;
  this.keys = Object.keys(obj);
  this.index = 0;
}

ObjectIterator.prototype.next = function() {
  if(this.index < this.keys.length) {
    var k = this.keys[this.index++];
    return {
      value: [k, this.obj[k]],
      done: false
    };
  }
  return {
    done: true
  }
};
///////////////////

function isNumber(x) {
    return typeof x === 'number';
  }
  function Reduced(value) {
  this['@@transducer/reduced'] = true;
  this['@@transducer/value'] = value;
}

function isReduced(x) {
  return (x instanceof Reduced) || (x && x['@@transducer/reduced']);
}

/**
 * This is for transforms that may call their nested transforms before
 * Reduced-wrapping the result (e.g. "take"), to avoid nested Reduced.
 */
function ensureReduced(val) {
  if(isReduced(val)) {
    return val;
  } else {
    return new Reduced(val);
  }
}


/**
 * This is for tranforms that call their nested transforms when
 * performing completion (like "partition"), to avoid signaling
 * termination after already completing.
 */
function ensureUnreduced(v) {
  if(isReduced(v)) {
    return deref(v);
  } else {
    return v;
  }
}



function PartitionMin(n, xform) {
  this.n = n;
  this.i = 0;
  this.xform = xform;
  this.part = new Array(n);

  //console.log(result,input, this.xform, this.part)

}

PartitionMin.prototype['@@transducer/init'] = function() {
  return this.xform['@@transducer/init']();
  console.log("init")
};

PartitionMin.prototype['@@transducer/result'] = function(v) {
  /*if (this.i > 0) {
    return ensureUnreduced(this.xform['@@transducer/step'](v, this.part.slice(0, this.i)));
  }*/
  console.log("result")
  return this.xform['@@transducer/result'](v);
};

PartitionMin.prototype['@@transducer/step'] = function(result, input) {
  this.part[this.i] = input;
  this.i += 1;
  if (this.i >= this.n) {
    //var out = this.part.slice(0, this.n);
    var out = this.part;//.slice(0, this.part.length);
    //this.part = new Array(this.n);
    this.i = 0;
    return this.xform['@@transducer/step'](result, out);
  }
  return result;
};

function partitionMin(coll, n) {
  if (isNumber(coll)) {
    n = coll; coll = null;
  }

  if (coll) {
    return seq(coll, partitionMin(n));
  }

  return function(xform) {
    return new PartitionMin(n, xform);
  };
}



export {partitionMin};
