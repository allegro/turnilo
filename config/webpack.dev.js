var path = require("path");
var webpack = require('webpack');
var hotMiddlewareScript = 'webpack-hot-middleware/client';


module.exports = {
  entry: {
    main: [hotMiddlewareScript, "./src/client/main.tsx"]
  },
  output: {
    path: path.resolve(__dirname, '../build/public'),
    filename: "main.js",
    chunkFilename: "[name].[hash].js",
    publicPath: '/'
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
              configFileName: "./src/client/tsconfig.json"
            }
          }
        ]
      },
      {
        enforce: "pre",
        test: /\.js$/,
        use: ["source-map-loader"]
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};
