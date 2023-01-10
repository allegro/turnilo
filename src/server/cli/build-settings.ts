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
import { getLogger } from "../../common/logger/logger";
import { emptySettings, fromConfig as appSettingsFromConfig } from "../../common/models/app-settings/app-settings";
import { ClusterAuthJS } from "../../common/models/cluster-auth/cluster-auth";
import { fromConfig as clusterFromConfig } from "../../common/models/cluster/cluster";
import { fromConfig as dataCubeFromConfig } from "../../common/models/data-cube/data-cube";
import { fromConfig as sourcesFromConfig, Sources, SourcesJS } from "../../common/models/sources/sources";
import { complement } from "../../common/utils/functional/functional";
import { isNil } from "../../common/utils/general/general";
import { pickValues } from "../../common/utils/object/object";
import { LoggerFormat, ServerSettings, ServerSettingsJS } from "../models/server-settings/server-settings";
import { TurniloSettings } from "./run-turnilo";

export interface ServerOptions {
  port?: number;
  verbose?: boolean;
  serverHost?: string;
  serverRoot?: string;
  loggerFormat?: LoggerFormat;
}

function overrideClustersAuth(config: SourcesJS, auth: ClusterAuthJS): SourcesJS {
  if (!config.clusters) return config;
  return {
    ...config,
    clusters: config.clusters.map(cluster => ({
      ...cluster,
      auth
    }))
  };
}

export default function buildSettings(config: object, options: ServerOptions, auth?: ClusterAuthJS): TurniloSettings {
  const definedOptions = pickValues(options, complement(isNil));
  const serverSettingsJS: ServerSettingsJS = {
    ...config,
    ...definedOptions
  };

  const serverSettings = ServerSettings.fromJS(serverSettingsJS);
  const logger = getLogger(serverSettings.loggerFormat);
  const appSettings = appSettingsFromConfig(config, logger);
  const sourcesJS = isNil(auth) ? config : overrideClustersAuth(config, auth);
  const sources = sourcesFromConfig(sourcesJS, logger);

  return {
    serverSettings,
    appSettings,
    sources
  };
}

export function settingsForDruidConnection(url: string, options: ServerOptions, auth?: ClusterAuthJS): TurniloSettings {
  const serverSettings = ServerSettings.fromJS(options);
  const logger = getLogger(serverSettings.loggerFormat);
  const sources: Sources = {
    dataCubes: [],
    clusters: [clusterFromConfig({
      name: "druid",
      url,
      auth
    }, logger)]
  };
  const appSettings = emptySettings(getLogger(serverSettings.loggerFormat));

  return {
    sources,
    appSettings,
    serverSettings
  };
}

export function settingsForDatasetFile(datasetPath: string, timeAttribute: string, options: ServerOptions): TurniloSettings {
  const serverSettings = ServerSettings.fromJS(options);
  const logger = getLogger(serverSettings.loggerFormat);
  const sources: Sources = {
    dataCubes: [dataCubeFromConfig({
      name: path.basename(datasetPath, path.extname(datasetPath)),
      clusterName: "native",
      source: datasetPath,
      timeAttribute
    }, undefined, logger)],
    clusters: []
  };
  const appSettings = emptySettings(getLogger(serverSettings.loggerFormat));

  return {
    sources,
    appSettings,
    serverSettings
  };
}
