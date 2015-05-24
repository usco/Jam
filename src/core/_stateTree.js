//import Baobab from 'baobab'

//import state from '../state'
/*
var stateTree = new Baobab({
  query: '',
  onlyProductsInStock: false,
  products: []
});*/

let Baobab = require('baobab')

let stateTree = new Baobab({})

module.exports = stateTree;