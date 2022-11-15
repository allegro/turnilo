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

import { NULL_LOGGER } from "../../common/logger/logger";
import { appSettingsToYaml, printExtra, sourcesToYaml } from "../../common/utils/yaml-helper/yaml-helper";
import { SettingsManager } from "../utils/settings-manager/settings-manager";
import { TurniloSettings } from "./run-turnilo";

export default function printIntrospectedSettings(
  { serverSettings, sources, appSettings }: TurniloSettings,
  withComments: boolean,
  version: string
) {
  const settingsManager = new SettingsManager(appSettings, sources, {
    anchorPath: process.cwd(),
    initialLoadTimeout: serverSettings.pageMustLoadTimeout,
    logger: NULL_LOGGER
  });

  return settingsManager.getFreshSources({
    timeout: 10000
  }).then(sources => {
    const config = [
      printExtra({
        header: true,
        version
      }, withComments),
      appSettingsToYaml(appSettings, withComments),
      sourcesToYaml(sources, withComments)
    ];

    process.stdout.write(config.join("\n"));
    process.exit();
  });
}
