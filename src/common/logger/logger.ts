/*
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

import { noop, Unary } from "../utils/functional/functional";

export interface Logger {
  log: Function;
  warn: Function;
  error: Function;
  addPrefix: Unary<String, Logger>;
}

class ConsoleLogger implements Logger {
  constructor(private prefixes: string[] = []) {
  }

  error(...args: any[]) {
    console.error(...this.prefixes, ...args);
  }

  warn(...args: any[]) {
    console.warn(...this.prefixes, ...args);
  }

  log(...args: any[]) {
    console.log(...this.prefixes, ...args);
  }

  addPrefix(prefix: string): Logger {
    return new ConsoleLogger([...this.prefixes, prefix]);
  }
}

export const LOGGER: Logger = new ConsoleLogger();

export const NULL_LOGGER: Logger = {
  error: noop,
  warn: noop,
  log: noop,
  addPrefix: noop
};
