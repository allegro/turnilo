/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import React from "react";
import * as ReactDOM from "react-dom";
import { SerializedAppSettings } from "../common/models/app-settings/app-settings";
import { Timekeeper, TimekeeperJS } from "../common/models/timekeeper/timekeeper";
import { TurniloApplication } from "./applications/turnilo-application/turnilo-application";
import { Loader } from "./components/loader/loader";
import { deserialize as deserializeAppSettings } from "./deserializers/app-settings";
import "./main.scss";
import { Ajax } from "./utils/ajax/ajax";
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
  appSettings: SerializedAppSettings;
  timekeeper: TimekeeperJS;
}

const config: Config = (window as any)["__CONFIG__"];
if (!config) {
  throw new Error("config not found");
}

const version = config.version;

Ajax.version = version;

const appSettings = deserializeAppSettings(config.appSettings);

if (config.appSettings.customization.sentryDSN) {
  errorReporterInit(config.appSettings.customization.sentryDSN, config.version);
}

const app = <TurniloApplication
  version={version}
  appSettings={appSettings}
  initTimekeeper={Timekeeper.fromJS(config.timekeeper)}
/>;

ReactDOM.render(app, container);

if (process.env.NODE_ENV === "dev-hmr" && module.hot) {
  module.hot.accept();
}
