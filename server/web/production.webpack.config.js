const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

let nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: ['./server/web/run.js'],
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: nodeModules,
  output: {
    path: path.resolve(__dirname, './dist/'),
    publicPath: '../../',
    filename: 'application-web.js'
  },
  resolve: {
    modules: [path.join(__dirname, '../../node_modules')],
    extensions: ['.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' },
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
};