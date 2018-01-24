const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  entry: ['./server/watch/run.js'],
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, './dist/'),
    publicPath: '../../',
    filename: 'application-watcher.js'
  },
  resolve: {
    modules: [path.join(__dirname, '../../node_modules')],
    extensions: ['.js'],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
  ],
};