var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
const production = process.argv.indexOf("-p") > -1;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  context: __dirname + '/src',
  entry: {
    'p5.sound': './index.js',
    'p5.sound.min': './index.js'
  },
  output: {
    // where we want to output built files
    path: __dirname + "/lib"
  },
  devtool: 'source-map',
  // devtool: production ? false : "eval",
  amd: true,
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/Tone(\.*)/, function(resource) {
      resource.request = path.join(__dirname, './node_modules/tone/', resource.request);
    }),
    new webpack.BannerPlugin({
      banner: fs.readFileSync('./fragments/before.frag').toString(),
      raw: true,
    })
  ],
  module: {
    rules: [
      { 
        test: /Tone(\.*)/, 
        use: {
          loader: 'uglify-loader'
        }
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        include: [/\.min\.js$/],
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: {
            drop_console: true
          },
          ecma: 6,
          mangle: true,
          output: {
            comments: false
          }
        },
        sourceMap: true,
      })
    ]
  }
}
