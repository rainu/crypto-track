const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: ['./client/js/main.js'],
  output: {
    path: path.resolve(__dirname, '../public/'),
    publicPath: '/',
    filename: 'crypto-track.js'
  },
  resolve: {
    modules: [path.join(__dirname, '../node_modules')],
    extensions: ['.js', '.vue'],
    alias: {
      'client': path.resolve(__dirname, '../client'),
      'components': path.resolve(__dirname, '../client/components'),
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: {
          'css': ExtractTextPlugin.extract(['css-loader']),
          'sass': ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
        }
      }
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.html$/,
      loader: 'vue-html-loader'
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: '[name].[ext]?[hash]'
      }
    }, {
      test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader?limit=10000&mimetype=application/font-woff'
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file-loader'
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../public/index.html'),
      template: path.resolve(__dirname, '../client/index.html'),
      inject: true
    }),
    new ExtractTextPlugin('build/style.css'),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      moment: "moment"
    })
  ],
  devtool: 'source-map'
};