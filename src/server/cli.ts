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

import { Option, program } from "commander";
import path from "path";
import { LOGGER } from "../common/logger/logger";
import { EMPTY_APP_SETTINGS, fromConfig as appSettingsFromConfig } from "../common/models/app-settings/app-settings";
import { fromConfig as clusterFromConfig } from "../common/models/cluster/cluster";
import { fromConfig as dataCubeFromConfig } from "../common/models/data-cube/data-cube";
import { fromConfig as sourcesFromConfig, Sources } from "../common/models/sources/sources";
import { appSettingsToYaml, printExtra, sourcesToYaml } from "../common/utils/yaml-helper/yaml-helper";
import createApp from "./app";
import createServer from "./cli/create-server";
import { loadConfigFile } from "./cli/load-config-file";
import { assertCredentials, parseInteger } from "./cli/utils";
import { ServerSettings, ServerSettingsJS } from "./models/server-settings/server-settings";
import { SettingsManager } from "./utils/settings-manager/settings-manager";
import { VERSION } from "./version";

const portOption = new Option("-p, --port <number>", "port number").argParser(parseInteger);
const serverRootOption = new Option("--server-root <root>", "server root");
const serverHostOption = new Option("--server-host <host>", "server host");
const verboseOption = new Option("--verbose", "verbose mode");
const usernameOption = new Option("--username <username>", "username");
const passwordOption = new Option("--password <password>", "password");

const version = VERSION;

program
  .name("turnilo")
  .description("Turnilo is a data exploration tool that connects to Druid database")
  .version(version, "--version");

program
  .command("run-config")
  .argument("<file>", "path of config file")
  .addOption(portOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(usernameOption)
  .addOption(passwordOption)
  .addOption(verboseOption)
  .action((configPath, { username, password, serverRoot, serverHost, port, verbose }) => {
    assertCredentials(username, password);
    // 1. load yml file as config
    const config = loadConfigFile(configPath);
    // 2. override config with all existing options
    const serverSettingsJS: ServerSettingsJS = {
      ...config,
      port,
      verbose,
      serverHost,
      serverRoot
    };
    // 3. create ServerSettings from 2
    const serverSettings = ServerSettings.fromJS(serverSettingsJS);
    // 4. create AppSettings and Sources from 2
    // TODO: pass credentials somewhere
    const appSettings = appSettingsFromConfig(config);
    const sources = sourcesFromConfig(config);
    // 5. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    const settingsManager = new SettingsManager(appSettings, sources, {
      anchorPath: path.dirname(configPath),
      initialLoadTimeout: serverSettings.pageMustLoadTimeout,
      verbose,
      logger: LOGGER
    });
    // 6. start ./app.ts with ServerSettings and code from ./www.ts
    createServer(serverSettings, createApp(serverSettings, settingsManager, version));
    console.log("run config with", configPath, "and options");
  });

program
  .command("run-examples")
  .addOption(portOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(verboseOption)
  .action(({ port, verbose, serverRoot, serverHost }) => {
    // 1. load config-examples.yaml file as config
    const configPath = path.join(__dirname, "../../config-examples.yaml");
    const config = loadConfigFile(configPath);
    // 2. override config with all existing options
    const serverSettingsJS: ServerSettingsJS = {
      ...config,
      port,
      verbose,
      serverHost,
      serverRoot
    };
    // 3. create ServerSettings from 2
    const serverSettings = ServerSettings.fromJS(serverSettingsJS);
    // 4. create AppSettings and Sources from 2
    const appSettings = appSettingsFromConfig(config);
    const sources = sourcesFromConfig(config);
    // 5. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    const settingsManager = new SettingsManager(appSettings, sources, {
      anchorPath: path.dirname(configPath),
      initialLoadTimeout: serverSettings.pageMustLoadTimeout,
      verbose,
      logger: LOGGER
    });
    // 6. start ./app.ts with ServerSettings and code from ./www.ts
    createServer(serverSettings, createApp(serverSettings, settingsManager, version));
  });

program
  .command("connect-druid")
  .argument("<url>", "druid url")
  .addOption(portOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(verboseOption)
  .addOption(usernameOption)
  .addOption(passwordOption)
  .action((url, { port, verbose, username, password, serverRoot, serverHost }) => {
    assertCredentials(username, password);
    // 1. create cluster from name: druid and passed url and empty dataCubes list
    // TODO: pass credentials somewhere
    const sources: Sources = {
      dataCubes: [],
      clusters: [clusterFromConfig({
        name: "druid",
        url
      })]
    };
    // 2. create appSettings from EMPTY_APP_SETTINGS
    const appSettings = EMPTY_APP_SETTINGS;
    // 3. create ServerSettings from options
    const serverSettings = ServerSettings.fromJS({ serverRoot, serverHost, port, verbose });
    // 4. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    const settingsManager = new SettingsManager(appSettings, sources, {
      anchorPath: process.cwd(),
      initialLoadTimeout: serverSettings.pageMustLoadTimeout,
      verbose,
      logger: LOGGER
    });
    // 5. start ./app.ts with ServerSettings and code from ./www.ts
    createServer(serverSettings, createApp(serverSettings, settingsManager, version));
  });

program
  .command("load-file")
  .argument("<file>", "json file")
  .addOption(portOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(verboseOption)
  .action((file, { port, verbose, serverHost, serverRoot }) => {
    // 1. create empty cluster list and dataCube:
    //  dataCubeFromConfig({
    //    name: path.basename(file, path.extname(file)),
    //    clusterName: "native",
    //    source: file
    //  }, undefined
    const sources: Sources = {
      dataCubes: [dataCubeFromConfig({
        name: path.basename(file, path.extname(file)),
        clusterName: "native",
        source: file
      }, undefined)],
      clusters: []
    };
    // 2. create appSettings from EMPTY_APP_SETTINGS
    const appSettings = EMPTY_APP_SETTINGS;
    // 3. create ServerSettings from options
    const serverSettings = ServerSettings.fromJS({ serverRoot, serverHost, port, verbose });
    // 4. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    const settingsManager = new SettingsManager(appSettings, sources, {
      anchorPath: process.cwd(),
      initialLoadTimeout: serverSettings.pageMustLoadTimeout,
      verbose,
      logger: LOGGER
    });
    // 5. start ./app.ts with ServerSettings and code from ./www.ts
    createServer(serverSettings, createApp(serverSettings, settingsManager, version));
  });

program
  .command("verify-config")
  .argument("<file>", "path to config file")
  .addOption(verboseOption)
  .action(file => {
    // 1. load yaml
    const config = loadConfigFile(file);
    try {
      // 2. create server settings
    const serverSettings = ServerSettings.fromJS(config);
    // 3. create app settings
    const appSettings = appSettingsFromConfig(config);
    // 4. create sources
    const sources = sourcesFromConfig(config);
      // 5. catch and log all errors
    } catch (e) {
      program.error("Config verification error: ", e.message);
    }
  });

program
  .command("introspect-druid")
  .argument("<url>", "druid url")
  .addOption(verboseOption)
  .addOption(usernameOption)
  .addOption(passwordOption)
  .option("--with-comments", "print comments")
  .action((url, { verbose, username, password, withComments }) => {
    assertCredentials(username, password);
    // 1. create cluster from name: druid and passed url and empty dataCubes list
    // TODO: pass credentials somewhere
    const sources: Sources = {
      dataCubes: [],
      clusters: [clusterFromConfig({
        name: "druid",
        url
      })]
    };
    // 2. create appSettings from EMPTY_APP_SETTINGS
    const appSettings = EMPTY_APP_SETTINGS;
    // 3. create ServerSettings from options
    const serverSettings = ServerSettings.fromJS({ verbose });
    // 4. create SettingsManager with 4, logger, verbose option, anchorPath (config path) and initialLoadTimeout (ServerSettings.pageMustLoadTimeout)
    const settingsManager = new SettingsManager(appSettings, sources, {
      anchorPath: process.cwd(),
      initialLoadTimeout: serverSettings.pageMustLoadTimeout,
      verbose,
      logger: LOGGER
    });
    // 5. call SettingsManager.getFreshSources with timeout 1000
    // 6. using yaml-helper print out appSettings, fetched sources and "Extra"
    settingsManager.getFreshSources({
      timeout: 10000
    }).then(sources => {
      const extra = {
        header: true,
        version: VERSION,
        verbose
        // Why port here? We don't start server so port is meaningless
        // port: SERVER_SETTINGS.port
      };
      const config = [
        printExtra(extra, withComments),
        appSettingsToYaml(appSettings, withComments),
        sourcesToYaml(sources, withComments)
      ].join("\n");
      process.stdout.write(config, () => process.exit());
    }).catch((e: Error) => {
      program.error("There was an error generating a config: " + e.message);
    });
  });

program.showHelpAfterError();

program.parse();
