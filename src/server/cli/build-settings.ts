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

import path from "path";
import {
  AppSettings,
  EMPTY_APP_SETTINGS,
  fromConfig as appSettingsFromConfig
} from "../../common/models/app-settings/app-settings";
import { fromConfig as clusterFromConfig } from "../../common/models/cluster/cluster";
import { fromConfig as dataCubeFromConfig } from "../../common/models/data-cube/data-cube";
import { fromConfig as sourcesFromConfig, Sources } from "../../common/models/sources/sources";
import { ServerSettings, ServerSettingsJS } from "../models/server-settings/server-settings";

interface Settings {
  serverSettings: ServerSettings;
  appSettings: AppSettings;
  sources: Sources;
}

interface Options {
  port?: number;
  verbose?: boolean;
  serverHost?: string;
  serverRoot?: string;
}

export default function buildSettings(config: object, options: Options = {}): Settings {
  const serverSettingsJS: ServerSettingsJS = {
    ...config,
    ...options
  };
  // 3. create ServerSettings from 2
  const serverSettings = ServerSettings.fromJS(serverSettingsJS);
  // 4. create AppSettings and Sources from 2
  const appSettings = appSettingsFromConfig(config);
  const sources = sourcesFromConfig(config);

  return {
    serverSettings,
    appSettings,
    sources
  };
}

export function settingsForDruidConnection(url: string, options: Options = {}): Settings {
  // TODO: pass credentials somewhere
  const sources: Sources = {
    dataCubes: [],
    clusters: [clusterFromConfig({
      name: "druid",
      url
    })]
  };
  const appSettings = EMPTY_APP_SETTINGS;
  const serverSettings = ServerSettings.fromJS(options);

  return {
    sources,
    appSettings,
    serverSettings
  };
}

export function settingsForDatasetFile(datasetPath: string, timeAttribute: string, options: Options = {}): Settings {
  // TODO: pass credentials somewhere
  const sources: Sources = {
    dataCubes: [dataCubeFromConfig({
      name: path.basename(datasetPath, path.extname(datasetPath)),
      clusterName: "native",
      source: datasetPath,
      timeAttribute
    }, undefined)],
    clusters: []
  };
  const appSettings = EMPTY_APP_SETTINGS;
  const serverSettings = ServerSettings.fromJS(options);

  return {
    sources,
    appSettings,
    serverSettings
  };
}
