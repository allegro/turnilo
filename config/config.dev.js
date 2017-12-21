const path = require("path");
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = {
  entry: "./src/client/swiv-entry.ts",
  output: {

    //publicPath: '/',
    filename: 'bundle.js',
    //sourceMapFilename: '[name].map',
    //chunkFilename: '[id].js',
    path: path.resolve(__dirname, 'build')
  },
  watch: true,
  devtool: "source-map",

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  devServer: {
    //contentBase: "./dist",
    // contentBase: path.resolve(__dirname, "dist"),
    // watchContentBase: true
    port: 3000
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader"
      },
      {
        enforce: "pre",
        test: /\.js$/, loader: "source-map-loader"
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
        loader: 'svg-loader'
      }
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  plugins: [
    new CheckerPlugin()
  ]
};