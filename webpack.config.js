var path = require('path');
var webpack = require('webpack');

var host   = "localhost";
var port = 3000;
var srcPath = "src"


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
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, srcPath)
    }]
  }
};
