var path = require("path");
var webpack = require('webpack');

module.exports = {
  entry: "./src/client/swiv-entry.ts",
  output: {
    path: path.resolve(__dirname, '../build/public'),
    filename: "swiv.js",
    chunkFilename: "[name].[hash].js"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader"
      },

      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" }
        ]
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
/*    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        dead_code: true,
        unused: true,
        comparisons: true,
        sequences: true,
        evaluate: true,
        conditionals: true,
        if_return: true,
        join_vars: true
      },
      output: {
        comments: false
      }
    })*/
  ]
};