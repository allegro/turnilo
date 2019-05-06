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
import { AppSettingsJS } from "../common/models/app-settings/app-settings";
import { TimekeeperJS } from "../common/models/timekeeper/timekeeper";
import { Loader } from "./components/loader/loader";
import "./main.scss";
import "./polyfills";
import { init as errorReporterInit } from "./utils/error-reporter/error-reporter";

const container = document.getElementsByClassName("app-container")[0];
if (!container) throw new Error("container not found");

// Add the loader
ReactDOM.render(
  React.createElement(Loader),
  container
);

interface Config {
  version: string;
  appSettings: AppSettingsJS;
  timekeeper: TimekeeperJS;
}

const config: Config = (window as any)["__CONFIG__"];
if (!config || !config.version || !config.appSettings || !config.appSettings.dataCubes) {
  throw new Error("config not found");
}

if (config.appSettings.customization.sentryDSN) {
  errorReporterInit(config.appSettings.customization.sentryDSN, config.version);
}

const version = config.version;

require.ensure([], require => {
  const { Ajax } = require("./utils/ajax/ajax");
  const { Timekeeper } = require("../common/models/timekeeper/timekeeper");
  const { AppSettings } = require("../common/models/app-settings/app-settings");
  const { MANIFESTS } = require("../common/manifests/index");
  const { TurniloApplication } = require("./applications/turnilo-application/turnilo-application");

  Ajax.version = version;

  const appSettings = AppSettings.fromJS(config.appSettings, {
    visualizations: MANIFESTS,
    executorFactory: Ajax.queryUrlExecutorFactory
  });

  const app =
    <TurniloApplication
      version={version}
      appSettings={appSettings}
      initTimekeeper={Timekeeper.fromJS(config.timekeeper)}
    />;

  ReactDOM.render(app, container);
}, "app");

// Polyfill =====================================

// From ../../assets/polyfill/drag-drop-polyfill.js
const div = document.createElement("div");
const dragDiv = "draggable" in div;
const evts = "ondragstart" in div && "ondrop" in div;

const needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);

if (needsPatch) {
  require.ensure([
    "../../lib/polyfill/drag-drop-polyfill.min.js",
    "../../lib/polyfill/drag-drop-polyfill.css"
  ], require => {
    const DragDropPolyfill = require("../../lib/polyfill/drag-drop-polyfill.min.js");
    require("../../lib/polyfill/drag-drop-polyfill.css");
    DragDropPolyfill.Initialize({});
  }, "ios-drag-drop");
}

if (process.env.NODE_ENV === "dev-hmr" && module.hot) {
  module.hot.accept();
}
