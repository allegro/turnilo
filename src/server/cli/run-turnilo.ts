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

import { Command } from "commander";
import { AppSettings } from "../../common/models/app-settings/app-settings";
import { Sources } from "../../common/models/sources/sources";
import createApp from "../app";
import { ServerSettings } from "../models/server-settings/server-settings";
import { SettingsManager } from "../utils/settings-manager/settings-manager";
import createServer from "./create-server";

export interface TurniloSettings {
  serverSettings: ServerSettings;
  appSettings: AppSettings;
  sources: Sources;
}

export default function runTurnilo(
  { serverSettings, sources, appSettings }: TurniloSettings,
  anchorPath: string,
  verbose: boolean,
  version: string,
  program: Command
) {

  const settingsManager = new SettingsManager(appSettings, sources, {
    anchorPath,
    initialLoadTimeout: serverSettings.pageMustLoadTimeout,
    verbose,
    logger: serverSettings.loggerFormat
  });
  createServer(serverSettings, createApp(serverSettings, settingsManager, version), settingsManager.logger, program);
}
