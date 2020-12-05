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

import { resolve } from "path";

function isFilePath(path: string): boolean {
  return path.startsWith(".") || path.startsWith("/");
}

/*
  Node's require accepts file paths and module names.
  We need to resolve paths but left module names intact.
  Module name is anything that don't start with slash or dot.
 */
function normalizeModulePath(modulePath: string, anchorPath: string): string {
  return isFilePath(modulePath) ? resolve(anchorPath, modulePath) : modulePath;
}

export function loadModule(modulePath: string, anchorPath: string): unknown {
  const path = normalizeModulePath(modulePath, anchorPath);
  try {
    return require(path);
  } catch (e) {
    throw new Error(`Couldn't load module from path ${path}. Error: ${e.message}`);
  }
}
