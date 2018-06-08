/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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

import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppSettingsJS, DataCube, TimekeeperJS } from "../common/models";
import { Loader } from "./components/loader/loader";
import "./main.scss";
import { addErrorMonitor } from "./utils/error-monitor/error-monitor";

addErrorMonitor();

var container = document.getElementsByClassName("app-container")[0];
if (!container) throw new Error("container not found");

// Add the loader
ReactDOM.render(
  React.createElement(Loader),
  container
);

interface Config {
  version: string;
  user: any;
  appSettings: AppSettingsJS;
  timekeeper: TimekeeperJS;
  stateful: boolean;
}

var config: Config = (window as any)["__CONFIG__"];
if (!config || !config.version || !config.appSettings || !config.appSettings.dataCubes) {
  throw new Error("config not found");
}

var version = config.version;

require.ensure([], require => {
  const { Ajax } = require("./utils/ajax/ajax");
  const { AppSettings, Timekeeper } = require("../common/models/index");
  const { MANIFESTS } = require("../common/manifests/index");
  const { SwivApplication } = require("./applications/swiv-application/swiv-application");

  Ajax.version = version;

  var appSettings = AppSettings.fromJS(config.appSettings, {
    visualizations: MANIFESTS,
    executorFactory: (dataCube: DataCube) => {
      return Ajax.queryUrlExecutorFactory(dataCube.name, "plywood");
    }
  });

  const app =
    <SwivApplication
      version={version}
      appSettings={appSettings}
      user={config.user}
      initTimekeeper={Timekeeper.fromJS(config.timekeeper)}
      stateful={Boolean(config.stateful)}
    />;

  ReactDOM.render(app, container);
}, "app");

// Polyfill =====================================

// From ../../assets/polyfill/drag-drop-polyfill.js
var div = document.createElement("div");
var dragDiv = "draggable" in div;
var evts = "ondragstart" in div && "ondrop" in div;

var needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);

if (needsPatch) {
  require.ensure([
    "../../lib/polyfill/drag-drop-polyfill.min.js",
    "../../lib/polyfill/drag-drop-polyfill.css"
  ], require => {
    var DragDropPolyfill = require("../../lib/polyfill/drag-drop-polyfill.min.js");
    require("../../lib/polyfill/drag-drop-polyfill.css");
    DragDropPolyfill.Initialize({});
  }, "ios-drag-drop");
}

if (process.env.NODE_ENV === "dev-hmr" && module.hot) {
  module.hot.accept();
}
