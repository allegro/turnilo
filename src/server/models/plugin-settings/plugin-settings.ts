/*
 * Copyright 2017-2020 Allegro.pl
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

import { Application } from "express";
import { Instance } from "immutable-class";
import { dictEqual } from "plywood";
import { Logger } from "../../../common/logger/logger";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { isNil } from "../../../common/utils/general/general";
import { ServerSettings } from "../server-settings/server-settings";

type PluginSettingsObject = object;

export interface PluginModule {
  plugin: (app: Application, pluginSettings: PluginSettingsObject, serverSettings: ServerSettings, appSettings: () => Promise<AppSettings>, logger: Logger) => void;
}

interface PluginSettingsValue {
  name: string;
  path: string;
  settings: PluginSettingsObject;
}

interface PluginSettingsJS {
  name: string;
  path: string;
  settings?: object;
}

export class PluginSettings implements Instance<PluginSettingsValue, PluginSettingsJS> {

  static fromJS({ name, path, settings }: PluginSettingsJS): PluginSettings {
    if (isNil(name)) throw new Error("Plugin must have a name");
    if (isNil(path)) throw new Error("Plugin must have a path");
    return new PluginSettings(name, path, settings);
  }

  constructor(public name: string, public path: string, public settings: object = {}) {
  }

  equals(other: Instance<PluginSettingsValue, PluginSettingsJS> | undefined): boolean {
    return other instanceof PluginSettings
      && this.name === other.name
      && this.path === other.path
      && dictEqual(this.settings, other.settings);
  }

  toJS(): PluginSettingsJS {
    return {
      settings: this.settings,
      name: this.name,
      path: this.path
    };
  }

  toJSON(): PluginSettingsJS {
    return this.toJS();
  }

  valueOf(): PluginSettingsValue {
    return {
      settings: this.settings,
      name: this.name,
      path: this.path
    };
  }
}
