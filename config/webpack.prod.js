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
        loader: "awesome-typescript-loader",
        query: {
          declaration: false,
          configFileName: "./src/client/tsconfig.json"
        }
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
    new webpack.optimize.UglifyJsPlugin({
      beautify: true,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true,
        dead_code: true,
        unused: true
      },
      comments: true
    })
  ]
};