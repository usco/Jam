let Cycle = require('cycle-react')
import App from './App2'


Cycle.applyToDOM('#root', App)


//for isomorphic/server side rendering
/*
let context = {}
let componentHtml = React.renderToString(
  React.createElement(App, {context: context})
)*/