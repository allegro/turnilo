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
import { Format } from '../../models/index';

function readSettingsFactory(filepath: string, format: Format, inline = false) {
  return () => {
    return Q(fs.readFile(filepath, 'utf-8')
      .then((fileData) => {
        switch (format) {
          case 'json': return JSON.parse(fileData);
          case 'yaml': return yaml.safeLoad(fileData);
          default: throw new Error(`unsupported format '${format}'`);
        }
      })
      .then((appSettingsJS) => {
        if (inline) appSettingsJS = inlineVars(appSettingsJS, process.env);
        return AppSettings.fromJS(appSettingsJS, { visualizations: MANIFESTS });
      })
    );
  };
}

function writeSettingsFactory(filepath: string, format: Format) {
  return (appSettings: AppSettings) => {
    return Q.fcall(() => {
      switch (format) {
        case 'json': return JSON.stringify(appSettings);
        case 'yaml': return appSettingsToYAML(appSettings, false);
        default: throw new Error(`unsupported format '${format}'`);
      }
    })
      .then((appSettingsYAML) => {
        return fs.writeFile(filepath, appSettingsYAML);
      });
  };
}

export interface StateStore {
  readState: () => Q.Promise<string>;
  writeState: (state: string) => Q.Promise<any>;
}

export class SettingsStore {
  static fromTransient(initAppSettings: AppSettings): SettingsStore {
    var settingsStore = new SettingsStore();
    settingsStore.readSettings = () => Q(initAppSettings);
    return settingsStore;
  }

  static fromReadOnlyFile(filepath: string, format: Format): SettingsStore {
    var settingsStore = new SettingsStore();
    settingsStore.readSettings = readSettingsFactory(filepath, format, true);
    return settingsStore;
  }

  static fromWritableFile(filepath: string, format: Format): SettingsStore {
    var settingsStore = new SettingsStore();
    settingsStore.readSettings = readSettingsFactory(filepath, format);
    settingsStore.writeSettings = writeSettingsFactory(filepath, format);
    return settingsStore;
  }

  static fromStateStore(stateStore: StateStore): SettingsStore {
    var settingsStore = new SettingsStore();

    settingsStore.readSettings = () => {
      return Q(stateStore.readState()
        .then((stateData) => AppSettings.fromJS(JSON.parse(stateData), { visualizations: MANIFESTS }))
      );
    };

    settingsStore.writeSettings = (appSettings: AppSettings) => {
      return Q.fcall(() => JSON.stringify(appSettings))
        .then((appSettingsJSON) => {
          return stateStore.writeState(appSettingsJSON);
        });
    };

    return settingsStore;
  }


  public readSettings: () => Q.Promise<AppSettings>;
  public writeSettings: (appSettings: AppSettings) => Q.Promise<any>;

  constructor() {}
}


