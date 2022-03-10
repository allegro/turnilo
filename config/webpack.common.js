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
const { IgnorePlugin } = require('webpack');

const toTranspilePattern = {
  test: /\.[jt]sx?$/,
  exclude: {
    and: [/node_modules/],
    not: [
      /* List of node modules to transpile */
      /react-syntax-highlighter/ // imported from "react-syntax-highlighter/src"
    ]
  }
}

const config = {
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, '../build/public'),
    filename: "[name].js",
    chunkFilename: "[name].[hash].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        use: ["source-map-loader"]
      },
      {
        ...toTranspilePattern,
        use: [{
          loader: "babel-loader",
          options: {
            envName: "modern"
          }
        }]
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
        loader: "file-loader",
      },
      {
        test: /\.svg$/,
        use: ["svg-inline-loader"]
      }
    ]
  }
};

module.exports.config = config;
module.exports.toTranspilePattern = toTranspilePattern;
