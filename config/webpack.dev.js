var path = require("path");
var webpack = require('webpack');
var hotMiddlewareScript = 'webpack-hot-middleware/client';

module.exports = {
  entry: {
    'swiv-entry': [hotMiddlewareScript, './src/client/swiv-entry.ts']
  },
  output: {
    path: path.resolve(__dirname, '../build/public'),
    filename: "swiv.js",
    chunkFilename: "[name].[hash].js",
    publicPath: '/'
  },
  devtool: "#source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          "awesome-typescript-loader"
        ]
      },
      {
        enforce: "pre",
        test: /\.js$/, loader: "source-map-loader"
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.svg$/,
        use: [
          "svg-inline-loader"
        ]
      }
    ]

  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};