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

import { Option } from "commander";
import { DEFAULT_LOGGER_FORMAT, DEFAULT_PORT, LOGGER_FORMAT_VALUES } from "../models/server-settings/server-settings";
import { parseInteger } from "./utils";

export const portOption = new Option(
  "-p, --port <number>",
  `Port number to start server on. Default: ${DEFAULT_PORT}`
).argParser(parseInteger);

export const loggerOption = new Option(
  "--logger-format <format>",
  `Format for logger. Default: ${DEFAULT_LOGGER_FORMAT}`
).choices(LOGGER_FORMAT_VALUES);

export const serverRootOption = new Option(
  "--server-root <path>",
  "Custom path to act as turnilo root"
);

export const serverHostOption = new Option(
  "--server-host <hostname>",
  "Host that server will bind to"
);

export const verboseOption = new Option(
  "--verbose",
  "Verbose mode"
);

export const usernameOption = new Option(
  "--username <username>",
  "Username that will be used in HTTP Basic authentication to Druid cluster"
);

export const passwordOption = new Option(
  "--password <password>",
  "Password that will be used in HTTP Basic authentication to Druid cluster"
);
