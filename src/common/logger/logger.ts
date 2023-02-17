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
import { isNil } from "../utils/general/general";
import { isoNow } from "../utils/time/time";

type LogFn = (msg: string, extra?: Record<string, unknown>) => void;
type LogLevel = "INFO" | "WARN" | "ERROR";

export function errorToMessage(error: Error): string {
  if (isNil(error.stack)) {
    return error.message;
  }
  return `${error.message}\n${error.stack}`;
}

export interface Logger {
  log: LogFn;
  warn: LogFn;
  error: LogFn;
  setLoggerId: Unary<String, Logger>;
}

class JSONLogger implements Logger {

  constructor(private logger = "turnilo") {
  }

  private logMessage(level: LogLevel, message: string, extra: Record<string, unknown> = {}) {
    console.log(JSON.stringify({
      message,
      level,
      "@timestamp": isoNow(),
      "logger": this.logger,
      ...extra
    }));
  }

  log(message: string, extra: Record<string, unknown> = {}) {
    this.logMessage("INFO", message, extra);
  }

  error(message: string, extra: Record<string, unknown> = {}) {
    this.logMessage("ERROR", message, extra);
  }

  warn(message: string, extra: Record<string, unknown> = {}) {
    this.logMessage("WARN", message, extra);
  }

  setLoggerId(loggerId: string): Logger {
    return new JSONLogger(loggerId);
  }
}

class ConsoleLogger implements Logger {
  constructor(private prefix = "") {
  }

  error(message: string) {
    console.error(this.prefix, message);
  }

  warn(message: string) {
    console.warn(this.prefix, message);
  }

  log(message: string) {
    console.log(this.prefix, message);
  }

  setLoggerId(loggerId: string): Logger {
    return new ConsoleLogger(loggerId);
  }
}

class AlwaysStdErrLogger implements Logger {
  setLoggerId(): Logger {
    return this;
  }

  error(message: string) {
    console.error(message);
  }

  log(message: string) {
    console.error(message);
  }

  warn(message: string) {
    console.error(message);
  }
}

export const NOOP_LOGGER: Logger = {
  error: noop,
  warn: noop,
  log: noop,
  setLoggerId: () => NOOP_LOGGER
};

const LOGGERS: Record<LoggerFormat, Logger> = {
  noop: NOOP_LOGGER,
  json: new JSONLogger(),
  plain: new ConsoleLogger(),
  error: new AlwaysStdErrLogger()
} as const;

export function getLogger(format: LoggerFormat): Logger {
  return LOGGERS[format];
}
