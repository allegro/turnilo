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

import * as fs from "fs-promise";
import * as yaml from "js-yaml";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { inlineVars } from "../../../common/utils/general/general";
import { Format } from "../../models/settings-location/settings-location";

function readSettingsFactory(filepath: string, format: Format, inline = false): () => Promise<AppSettings> {
  return () => fs.readFile(filepath, "utf-8")
    .then(fileData => {
      switch (format) {
        case "json":
          return JSON.parse(fileData);
        case "yaml":
          return yaml.safeLoad(fileData);
        default:
          throw new Error(`unsupported format '${format}'`);
      }
    })
    .then(appSettingsJS => {
      if (inline) appSettingsJS = inlineVars(appSettingsJS, process.env);
      return AppSettings.fromJS(appSettingsJS, {  });
    });
}

export class SettingsStore {
  static fromTransient(initAppSettings: AppSettings): SettingsStore {
    let settingsStore = new SettingsStore();
    settingsStore.readSettings = () => Promise.resolve(initAppSettings);
    return settingsStore;
  }

  static fromReadOnlyFile(filepath: string, format: Format): SettingsStore {
    let settingsStore = new SettingsStore();
    settingsStore.readSettings = readSettingsFactory(filepath, format, true);
    return settingsStore;
  }

  public readSettings: () => Promise<AppSettings>;

  constructor() {
  }
}
