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

import { LOGGER } from "../../common/logger/logger";
import { AppSettings } from "../../common/models/app-settings/app-settings";
import { Sources } from "../../common/models/sources/sources";
import { appSettingsToYaml, printExtra, sourcesToYaml } from "../../common/utils/yaml-helper/yaml-helper";
import { ServerSettings } from "../models/server-settings/server-settings";
import { SettingsManager } from "../utils/settings-manager/settings-manager";
import { VERSION } from "../version";

export default function printIntrospectedSettings(
  serverSettings: ServerSettings,
  appSettings: AppSettings,
  sources: Sources,
  verbose: boolean
) {
  const settingsManager = new SettingsManager(appSettings, sources, {
    anchorPath: process.cwd(),
    initialLoadTimeout: serverSettings.pageMustLoadTimeout,
    verbose,
    logger: LOGGER
  });

  return settingsManager.getFreshSources({
    timeout: 10000
  }).then(sources => {
    const extra = {
      header: true,
      version: VERSION,
      verbose
      // Why port here? We don't start server so port is meaningless
      // port: SERVER_SETTINGS.port
    };
    const config = [
      printExtra(extra, verbose),
      appSettingsToYaml(appSettings, verbose),
      sourcesToYaml(sources, verbose)
    ].join("\n");
    process.stdout.write(config);
  });
}
