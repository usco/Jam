var path = require('path');
var webpack = require('webpack');
var fs = require('fs')

var host   = "localhost";
var port = 3000;
var srcPath = "src"

console.log( "YEEEEHAAA", path.join(__dirname, "node_modules","usco-kernel2/src/") );
//fs.realpathSync
module.exports = {
  host:host,
  port:port,
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?',//http://'+host+":"+port,
    'webpack/hot/only-dev-server',
    './'+srcPath+'/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'+'dist'+'/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    //new webpack.optimize.DedupePlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx','json']
  },
  module: {
    loaders: [
      { test: /\.json$/,   loader: "json-loader" },
      { test: /\.js$/, loader:'react-hot', include: path.join(__dirname, srcPath) },
      { test: /\.js$/, loader: 'babel?experimental&optional=runtime', exclude: "", include: 
        [
          path.join(__dirname, srcPath),
          //"/home/ckaos/dev/projects/coffeescad/kernel/usco-kernel2/src/"
          fs.realpathSync( path.join(__dirname, "node_modules","usco-kernel2/src/") ) //needed only FOR DEV ??
        ]
      },
    ]
  },
  resolve: {
    /*extensions: ['', '.js'],*/
    root: [
      path.join(__dirname, "node_modules"),
      //"/home/ckaos/dev/projects/jam",
      //"/home/ckaos/dev/projects/coffeescad/kernel/usco-kernel2/src"
    ],
    alias: {                                                                                    
        "usco-kernel2$":path.join(__dirname, "node_modules","usco-kernel2/src/kernel.js"),//needed only FOR DEV
    }
  }
};
