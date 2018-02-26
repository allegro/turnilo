var path = require("path");
var webpack = require('webpack');

module.exports = {
  entry: {
    main: ["./src/client/main.tsx"]
  },
  output: {
    path: path.resolve(__dirname, '../build/public'),
    filename: "main.js",
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
        use: [
          {
            loader: "awesome-typescript-loader",
            options: {
              declaration: false,
              configFileName: "./src/client/tsconfig.json"
            }
          }
        ]
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
        use: ["svg-inline-loader"]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin()
  ]
};
