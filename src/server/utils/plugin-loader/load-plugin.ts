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
import { resolve } from "path";
import { isFunction } from "util";
import { PluginModule } from "../../models/plugin-settings/plugin-settings";

function isFilePath(path: string): boolean {
  return path.startsWith(".") || path.startsWith("/");
}

/*
  Node's require accepts file paths and module names.
  We need to resolve paths but left module names intact.
  Module name is anything that don't start with slash or dot.
 */
function normalizePluginPath(pluginPath: string, anchorPath: string): string {
  return isFilePath(pluginPath) ? resolve(anchorPath, pluginPath) : pluginPath;
}

export function loadPlugin(pluginPath: string, anchorPath: string): PluginModule {
  let module;
  try {
    module = require(normalizePluginPath(pluginPath, anchorPath)) as PluginModule;
  } catch (e) {
    throw new Error(`Couldn't load module from path ${pluginPath}`);
  }
  if (!module || !isFunction(module.plugin)) {
    throw new Error("Module has no plugin function defined");
  }
  return module;
}
