/*mish mash between different webpack examples
react hot boilerplate
https://github.com/shanewilson/react-webpack-example/blob/master/webpack.config.js
*/
var fs      = require('fs');
var path    = require('path');
var webpack = require('webpack');
var CompressionPlugin = require("compression-webpack-plugin");

var srcPath = "src"

var production = process.env.NODE_ENV == 'production';
var dev        = process.env.NODE_ENV == 'dev';

//add any extra folders we want to apply loaders to 
var pathsToInclude = path.join(__dirname, srcPath)


var config= {
  target: 'node',
  entry: [
    './'+srcPath+'/components/webgl/view.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'jam-headless.js',
    publicPath: '/dist/' //'/'+'dist'+'/'
  },
  plugins: [
  ],
  module: {
    loaders: [
      { test: /\.js?$/, loaders: ['babel'],include : pathsToInclude,exclude: /(node_modules|bower_components)/},
    ],
    noParse: /\.min\.js/
  },
  resolve: {
    extensions: ['', '.js'],
    root: [
      path.join(__dirname, "node_modules"),
    ],
  },
  resolveLoader:{
    root : path.join(__dirname, "node_modules")
  }
};

//console.log("production",production,"dev",dev)

if (production) {
  config.bail = true
  config.debug = false
  config.profile = false
  config.output.pathInfo = false
  config.output.publicPath = './dist/'//withouth this, issues with webworker paths

  //config.devtool = "#source-map";
  //config.output.filename = "[name].min.js"//"[name].[hash].min.js"
  //config.output.chunkFilename = '[id].js'
  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify('production') } })
    , new webpack.optimize.DedupePlugin()
    , new webpack.NoErrorsPlugin()
  ])
}
else{
  config.entry = config.entry.concat([
    'webpack-dev-server/client?',//http://'+host+":"+port,
    'webpack/hot/only-dev-server',
  ])
  config.plugins = config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
  ])
}






module.exports = config;
