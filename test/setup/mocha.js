/*
 * Copyright 2017-2022 Allegro.pl
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

require("@babel/register")({
    cache: true,
    configFile: false,
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    presets: [
        "@babel/preset-typescript",
        ["@babel/preset-env", {
            targets: {
                node: 'current'
            }
        }],
        "@babel/preset-react",
    ]
 });
require("ignore-styles");

const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

enzyme.configure({ adapter: new Adapter() });
