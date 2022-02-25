/*
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const babelLoader = {
  loader: "babel-loader",
  options: {
    presets: [
      ["@babel/preset-env", {
        modules: false
      }]
    ]
  }
};

module.exports = {
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, '../build/public'),
    filename: "main.js",
    chunkFilename: "[name].[hash].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  plugins: [
    new MiniCssExtractPlugin(),
  ],
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        use: ["source-map-loader"]
      },
      {
        test: /\.js?$/,
        use: [
          babelLoader
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          babelLoader,
          {
            loader: "ts-loader",
            options: {
              configFile: "src/client/tsconfig.json"
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(woff|woff2)$/i,
        loader: "url-loader",
        options: {
          // Returns a data-url (data:font/woff;charset=utf-8;base64,...)
          // if the file is smaller than a byte limit.
          limit: 8192,
        },
      },
      {
        test: /\.svg$/,
        use: ["svg-inline-loader"]
      }
    ]
  }
};
