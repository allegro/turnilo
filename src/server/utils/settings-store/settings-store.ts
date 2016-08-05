/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as Q from 'q';
import * as fs from 'fs-promise';
import * as yaml from 'js-yaml';
import { inlineVars } from '../../../common/utils/general/general';
import { MANIFESTS } from '../../../common/manifests/index';
import { AppSettings } from '../../../common/models/index';
import { appSettingsToYAML } from '../../../common/utils/yaml-helper/yaml-helper';

function readSettingsYamlFactory(filepath: string) {
  return () => {
    return Q(fs.readFile(filepath, 'utf-8')
      .then((fileData) => {
        var appSettingsJS = yaml.safeLoad(fileData);
        appSettingsJS = inlineVars(appSettingsJS, process.env);
        return Q(AppSettings.fromJS(appSettingsJS, { visualizations: MANIFESTS }));
      })
    );
  };
}

function writeSettingsYamlFactory(filepath: string) {
  return (appSettings: AppSettings) => {
    return Q.fcall(() => {
      return appSettingsToYAML(appSettings, false);
    })
      .then((appSettingsYAML) => {
        return fs.writeFile(filepath, appSettingsYAML);
      });
  };
}

export class SettingsStore {
  static fromTransient(initAppSettings: AppSettings): SettingsStore {
    var settingsStore = new SettingsStore();
    settingsStore.readSettings = () => Q(initAppSettings);
    return settingsStore;
  }

  static fromReadOnlyFile(filepath: string): SettingsStore {
    var settingsStore = new SettingsStore();
    settingsStore.readSettings = readSettingsYamlFactory(filepath);
    return settingsStore;
  }

  static fromWritableFile(filepath: string): SettingsStore {
    var settingsStore = new SettingsStore();
    settingsStore.readSettings = readSettingsYamlFactory(filepath);
    settingsStore.writeSettings = writeSettingsYamlFactory(filepath);
    return settingsStore;
  }


  public readSettings: () => Q.Promise<AppSettings>;
  public writeSettings: (appSettings: AppSettings) => Q.Promise<any>;

  constructor() {}
}


