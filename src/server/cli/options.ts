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
import { parseInteger } from "./utils";

export const portOption = new Option("-p, --port <number>", "port number").argParser(parseInteger);
export const serverRootOption = new Option("--server-root <root>", "server root");
export const serverHostOption = new Option("--server-host <host>", "server host");
export const verboseOption = new Option("--verbose", "verbose mode");
export const usernameOption = new Option("--username <username>", "username");
export const passwordOption = new Option("--password <password>", "password");
