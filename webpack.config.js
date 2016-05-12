var fs = require('fs')
var path = require('path')
var webpack = require('webpack')
var WebpackStrip = require('webpack-strip') // to remove console.log etc statement
var StringReplacePlugin = require('string-replace-webpack-plugin')

var host = 'localhost'
var port = 3000
var srcPath = 'src'

var production = process.env.NODE_ENV === 'production'
var testMode = (process.env.MODE === undefined || process.env.MODE !== 'production') ? true : false
console.log('running in production mode', production, 'in test mode', testMode)

var getSymlinkedModules = function () {
  var rootPath = path.join(__dirname, 'node_modules')
  var contents = fs.readdirSync(rootPath)
  var results = contents
    .map(function (entry) {
      var fPath = path.join(rootPath, entry)
      return fPath
    })
    .filter(function (fPath) {
      function check (entry) {
        var stats = fs.lstatSync(fPath)
        return stats.isSymbolicLink()
      }
      return check(fPath)
    })
    .map(function (fPath) {
      return fs.realpathSync(fPath)
    })
  return results
}

// add any extra folders we want to apply loaders to
var pathsToInclude = [path.join(__dirname, srcPath)] // getSymlinkedModules().concat( path.join(__dirname, srcPath) )

// FIXME !! temporary hack: add any paths where loaders should be apllied
// pathsToInclude.push( path.join(__dirname, "node_modules", "glView-helpers") )

// ugh, also needed because of workers (ie worker loader)
// pathsToInclude.push( path.join(__dirname, "node_modules", "usco-stl-parser")   )
// pathsToInclude.push( path.join(__dirname, "node_modules", "usco-ctm-parser")   )
// pathsToInclude.push( path.join(__dirname, "node_modules", "usco-ply-parser")   )

console.log('pathsToInclude', pathsToInclude)
pathsToInclude.push(path.join(__dirname, 'node_modules', 'usco-ym-storage'))

// console.log("will user loaders on",pathsToInclude)

var config = {
  host: host,
  port: port,
  devtool: 'eval',
  entry: {
    jam: './' + srcPath + '/index'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/' // '/'+'dist'+'/'
  },
  plugins: [
    // new webpack.NoErrorsPlugin(),
    // new webpack.optimize.DedupePlugin()
    // new webpack.optimize.CommonsChunkPlugin("init.js")
    new StringReplacePlugin()
  ],
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      // { test: /-worker*\.js$/, loader: "worker-loader",include : pathsToInclude},//if any module does "require(XXX-worker)" it converts to a web worker
      { test: /\.js$/, loaders: ['babel'], // /* WebpackStrip.loader('console.log', 'console.error')*/
      include: pathsToInclude},//, exclude: /(node_modules|bower_components)/ 
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      // special string replacements , could be cleaner
      { test: /index.js$/, loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: `mode = 'production'`,
              replacement: function (match, p1, offset, string) {
                return 'mode = "' + process.env.NODE_ENV + '"'
              }
            }
        ]})
      }
    ],
    noParse: [
      /\.min\.js/
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', 'json'],
    root: [
      path.join(__dirname, 'node_modules')
    ],
    /* alias: {
        "q$":path.join(__dirname, "node_modules","usco-kernel2/src/kernel.js"),//needed only FOR DEV
    }*/
    alias: {
      'three$': path.join(__dirname, 'node_modules', 'three/three.min.js'),
    }

  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  }
}

// console.log("production",production,"dev",dev)

if (production) {
  config.bail = true
  config.debug = false
  config.profile = false
  config.output.pathInfo = false
  config.output.publicPath = './dist/' // withouth this, issues with webworker paths

  // config.devtool = "#source-map"
  // config.output.filename = "[name].min.js"//"[name].[hash].min.js"
  // config.output.chunkFilename = '[id].js'
  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }),
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
    new webpack.optimize.DedupePlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({ minimize: true }) // ,drop_console:true})
  /*
  new webpack.optimize.UglifyJsPlugin({
    mangle: {
      except: ['require', 'export', '$super', 'import']
    },
    compress: {
      warnings: false,
      sequences: true,
      dead_code: true,
      conditionals: true,
      booleans: true,
      unused: true,
      if_return: true,
      join_vars: true,
      drop_console: true
    }
  })
  , new CompressionPlugin({
    asset: "{file}.gz",
    algorithm: "gzip",
    regExp: /\.js$|\.html$/,
    threshold: 10240,
    minRatio: 0.8
  })*/
  ])

  /* config.module= {
    loaders: [
      { test: /\.json$/,   loader: "json-loader" },//?optional[]=runtime&optional=es6.blockScoping
      //{ test: /-worker*\.js$/, loader: "worker-loader",include : pathsToInclude},//if any module does "require(XXX-worker)" it converts to a web worker
      //'react-hot',
      { test: /\.js?$/, loaders: [WebpackStrip.loader('console.log', 'console.error') ,'babel', ],include : pathsToInclude,exclude: /(node_modules|bower_components)/},
      { test: /\.css$/, loader: "style-loader!css-loader" },
      //{ test: /\.js$/, loader: }

    ],
    noParse: /\.min\.js/
  }*/
  var stripLoader = {
    test: [],
    loader: WebpackStrip.loader('console.log')
  }

  config.module.loaders.push(stripLoader)
} else {
  /* config.entry = config.entry.concat([
    //'webpack-dev-server/client?',//http://'+host+":"+port,
    //'webpack/hot/only-dev-server',
  ])*/

  /* var ymReplacerLoader = {
    test: /youMagineDriver.js$/,loader: StringReplacePlugin.replace({
    replacements: [
        {
            pattern: 'api.',
            replacement: function (match, p1, offset, string) {
                return 'api-test.'
            }
        }
    ]})
  }
  config.module.loaders.push(ymReplacerLoader)*/

  config.plugins = config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
  ])
}

module.exports = config
