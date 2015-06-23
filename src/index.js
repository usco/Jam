/*import React from 'react';
import App from './App';

React.render(<App />, document.getElementById('root'));*/
require("./app.css")
let Cycle = require('cycle-react')
import Timer from './App2'
import GlView from './components/webgl/GlView'


Cycle.applyToDOM('#root', GlView)
