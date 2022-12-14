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

import { LoggerFormat } from "../../server/models/server-settings/server-settings";
import { noop, Unary } from "../utils/functional/functional";

export interface Logger {
  log: Function;
  warn: Function;
  error: Function;
  addPrefix: Unary<String, Logger>;
}

class JSONLogger implements Logger {

  constructor(private logger = "turnilo") {
  }

  log(message: string, extra: Record<string, string>) {
    console.log(JSON.stringify({
      message,
      time: new Date().toISOString(),
      level: "INFO",
      logger: this.logger,
      ...extra
    }));
  }

  addPrefix(prefix: string): Logger {
    return new JSONLogger(prefix);
  }

  error(message: string, extra: Record<string, string>) {
    console.log(JSON.stringify({
      message,
      time: new Date().toISOString(),
      level: "ERROR",
      logger: this.logger,
      ...extra
    }));
  }

  warn(message: string, extra: Record<string, string>) {
    console.log(JSON.stringify({
      message,
      time: new Date().toISOString(),
      level: "WARN",
      logger: this.logger,
      ...extra
    }));
  }
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

class ErrorLogger implements Logger {
  addPrefix(): Logger {
    return this;
  }

  error(...args: any[]) {
    console.error(...args);
  }

  log(...args: any[]) {
    console.error(...args);
  }

  warn(...args: any[]) {
    console.error(...args);
  }
}

export const NOOP_LOGGER: Logger = {
  error: noop,
  warn: noop,
  log: noop,
  addPrefix: noop
};

const LOGGERS: Record<LoggerFormat, Logger> = {
  noop: NOOP_LOGGER,
  json: new JSONLogger(),
  plain: new ConsoleLogger(),
  error: new ErrorLogger()
} as const;

export function getLogger(format: LoggerFormat): Logger {
  return LOGGERS[format];
}
