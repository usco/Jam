//import Baobab from 'baobab'

//import state from '../state'
/*
var stateTree = new Baobab({
  query: '',
  onlyProductsInStock: false,
  products: []
});*/

var Baobab = require('baobab');


/*var stateTree = new Baobab({
  admin: {
    notifications: {
      list: []
    }
  },
  home: {
    feeds: []
  },
  user:{
    job:"unemployed",
    age:25
  }
});*/

var stateTree = new Baobab({
  admin: {
    notifications: {
      list: []
    }
  },
  home: {
    feeds: []
  },
  user:{
     job:"unemployed",
      age:25,
  }
});

module.exports = stateTree;