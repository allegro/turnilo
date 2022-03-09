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

const commonConfig = require('./webpack.common');
const merge = require('webpack-merge');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { default: StatoscopeWebpackPlugin } = require("@statoscope/webpack-plugin");

const bundleAnalyzerConfig = {
  plugins: [
    new StatoscopeWebpackPlugin({
      open: false,
      saveReportTo: "./build/report-[name].html",
      saveStatsTo: "./build/report-[name].json",
    }),
  ]
}

const polyfillsConfig = {
  entry: {
    polyfills: "./src/client/polyfills.ts",
    dnd: "./src/client/drag-and-drop-polyfill.ts",
  }
};

const prodConfig = {
  name: "client-modern",
  mode: "production",
  entry: {
    main: "./src/client/main.tsx",
  },
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
  ],
  stats: 'minimal'
};

const es5Config = {
  module: {
    rules: [{
      test: /\.[jt]sx?$/,
      exclude: {
        and: [/node_modules/],
        not: [
          /react-syntax-highlighter/,
        ]
      },
      use: [{
        loader: "babel-loader",
        options: {
          envName: "legacy",
        },
      }],
    }]
  },
  name: "client-legacy",
  output: {
    filename: "[name].es5.js",
  }
};

module.exports = [
  merge.smart(commonConfig, prodConfig, bundleAnalyzerConfig),
  merge.smart(commonConfig, prodConfig, es5Config, polyfillsConfig),
]
