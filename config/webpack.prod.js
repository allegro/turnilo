var path = require("path");
var webpack = require('webpack');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

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
        loader: "awesome-typescript-loader?{configFileName: \"tsconfig-prod.json\"}"
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
    })
  ]
};

resolve: {
  plugins: [
    new TsConfigPathsPlugin(/* { tsconfig, compiler } */)
  ]
}