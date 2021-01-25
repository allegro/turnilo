/*
 * Copyright 2017-2018 Allegro.pl
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
import { isFunction } from "util";
import { PluginModule } from "../../models/plugin-settings/plugin-settings";
import { loadModule } from "../module-loader/module-loader";

export function loadPlugin(pluginPath: string, anchorPath: string): PluginModule {
  const module = loadModule(pluginPath, anchorPath) as PluginModule;
  if (!module || !isFunction(module.plugin)) {
    throw new Error("Module has no plugin function defined");
  }
  return module;
}
