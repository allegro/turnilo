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
require("ts-node").register({
  compilerOptions: {
    module: "commonjs",
    target: "es5",
    downlevelIteration: true
  },
  typeCheck: true,
});
require("ignore-styles");

const jsdom = require("jsdom").jsdom;

const document = (new jsdom("<!doctype html><html><body></body></html>"));
global.document = document;
global.window = document.defaultView;
// setup for type-detect, should be solved in https://github.com/chaijs/type-detect/pull/129
global.HTMLElement = global.window.HTMLElement;
// setup for React
global.navigator = {userAgent: "testing"};

const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

enzyme.configure({ adapter: new Adapter() });
