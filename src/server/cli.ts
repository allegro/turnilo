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

import { InvalidArgumentError, Option, program } from "commander";
import { VERSION } from "./version";

function assertIntegerOption(value: string): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) throw new InvalidArgumentError("Must be an integer");
  return parsed;
}

const port = new Option("-p, --port <number>", "port number").argParser(assertIntegerOption).default(900); // TODO: DEFAULT_PORT
const serverRoot = new Option("--server-root <root>", "server root").default(""); // TODO: DEFAULT_ROOT
const serverHost = new Option("--server-host <host>", "server host").default(null); // TODO: DEFAULT_HOST
const verbose = new Option("--verbose", "verbose mode").default(false);
const username = new Option("--username <username>", "username");
const password = new Option("--password <password>", "password");

function assertCredentials(username: string | undefined, password: string | undefined) {
  if (password && !username || username && !password) {
    program.error("You need to pass both username and password");
  }
}

program
  .name("turnilo")
  .description("Turnilo is a data exploration tool that connects to Druid database")
  .version(VERSION, "--version");

program
  .command("run-config")
  .argument("<file>", "path of config file")
  .addOption(port)
  .addOption(serverRoot)
  .addOption(serverHost)
  .addOption(username)
  .addOption(password)
  .addOption(verbose)
  .action((configPath, { username, password, serverRoot, serverHost, port, verbose }) => {
    assertCredentials(username, password);
    /*
    1. load yml file as config
    2. override config with all existing options
    3. create ServerSettings from 2
    4. create AppSettings and Sources from 2
    5. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    6. start ./app.ts with ServerSettings and code from ./www.ts
     */
    console.log("run config with", configPath, "and options", { port, verbose });
  });

program
  .command("run-examples")
  .addOption(port)
  .addOption(serverRoot)
  .addOption(serverHost)
  .addOption(verbose)
  .action(({ port, verbose, serverRoot, serverHost }) => {
    /*
    1. load config-examples.yaml file as config
    2. override config with all existing options
    3. create ServerSettings from 2
    4. create AppSettings and Sources from 2
    5. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    6. start ./app.ts with ServerSettings and code from ./www.ts
     */
    console.log("run examples with options", { port, verbose });
  });

program
  .command("connect-druid")
  .argument("<url>", "druid url")
  .addOption(port)
  .addOption(serverRoot)
  .addOption(serverHost)
  .addOption(verbose)
  .option("--username <username>", "username")
  .option("--password <password>", "password")
  .action((url, { port, verbose, username, password }) => {
    assertCredentials(username, password);
    /*
    1. create cluster from name: druid and passed url and empty dataCubes list
    2. create appSettings from EMPTY_APP_SETTINGS
    3. create ServerSettings from options
    4. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    5. start ./app.ts with ServerSettings and code from ./www.ts
     */
    console.log("connect to", url, "with options", { port, verbose, username, password });
  });

program
  .command("load-file")
  .argument("<file>", "json file")
  .addOption(port)
  .addOption(serverRoot)
  .addOption(serverHost)
  .addOption(verbose)
  .action((file, { port, verbose, serverHost, serverRoot }) => {
    /*
    1. create empty cluster list and dataCube:
      dataCubeFromConfig({
        name: path.basename(file, path.extname(file)),
        clusterName: "native",
        source: file
      }, undefined
    2. create appSettings from EMPTY_APP_SETTINGS
    3. create ServerSettings from options
    4. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    5. start ./app.ts with ServerSettings and code from ./www.ts
     */
    console.log("load file", file, "with options", { port, verbose, serverHost, serverRoot });
  });

program
  .command("verify-config")
  .argument("<file>", "path to config file")
  .addOption(verbose)
  .action(file => {
    /*
    1. load yaml
    2. create server settings
    3. create app settings
    4. create sources
    5. catch and log all errors
    6. return status code
     */
    console.log("verify config from", file);
  });

program
  .command("introspect-druid")
  .argument("<url>", "druid url")
  .addOption(port)
  .addOption(serverRoot)
  .addOption(serverHost)
  .addOption(verbose)
  .addOption(username)
  .addOption(password)
  .option("--with-comments", "print comments")
  .action((url, { port, verbose, username, password, withComments }) => {
    assertCredentials(username, password);
    /*
    1. create cluster from name: druid and passed url and empty dataCubes list
    2. create appSettings from EMPTY_APP_SETTINGS
    3. create ServerSettings from options
    4. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    5. call SettingsManager.getFreshSources with timeout 1000
    6. using yaml-helper print out appSettings, fetched sources and "Extra"
     */
    console.log("introspect ", url, "with options", { port, verbose, username, password, withComments });
  });

program.showHelpAfterError();

program.parse();
