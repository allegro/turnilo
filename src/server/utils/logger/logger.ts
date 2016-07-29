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

export interface Logger {
  log: (line: string) => void;
  warn: (line: string) => void;
  error: (line: string) => void;
}

function noop() {}

export const LOGGER: Logger = {
  log: noop,
  warn: noop,
  error: noop
};

export function initLogger(): void {
  LOGGER.log = console.log.bind(console);
  LOGGER.warn = console.warn.bind(console);
  LOGGER.error = console.error.bind(console);
}
