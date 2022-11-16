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
import path from "path";
import { loadFileSync } from "./utils/file/file";

const PACKAGE_FILE = path.join(__dirname, "../../package.json");

export const readVersion = (): string => {
  const packageObj = loadFileSync(PACKAGE_FILE, "json");
  if (!("version" in packageObj)) {
    throw new Error("Couldn't read version from package.json");
  }
  return (packageObj as any).version;
};
