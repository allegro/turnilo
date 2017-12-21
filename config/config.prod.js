var path = require("path");

module.exports = {
  entry: "./src/client/swiv-entry.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, '/dist')
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
        enforce: "pre",
        test: /\.js$/, loader: "source-map-loader"
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
      }
    ]
  },

  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  }
}