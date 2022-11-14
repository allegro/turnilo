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
import createApp from "./app";
import buildSettings, { settingsForDatasetFile, settingsForDruidConnection } from "./cli/build-settings";
import createServer from "./cli/create-server";
import printIntrospectedSettings from "./cli/introspect-cluster";
import { loadConfigFile } from "./cli/load-config-file";
import { parseCredentials, parseInteger } from "./cli/utils";
import { SettingsManager } from "./utils/settings-manager/settings-manager";
import { readVersion } from "./version";

const portOption = new Option("-p, --port <number>", "port number").argParser(parseInteger);
const serverRootOption = new Option("--server-root <root>", "server root");
const serverHostOption = new Option("--server-host <host>", "server host");
const verboseOption = new Option("--verbose", "verbose mode");
const usernameOption = new Option("--username <username>", "username");
const passwordOption = new Option("--password <password>", "password");

let version: string;
try {
  version = readVersion();
} catch (e) {
  program.error(`Failed to read turnilo version. Error: ${e.message}`);
}

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
    const anchorPath = path.dirname(configPath);
    const auth = parseCredentials(username, password, "http-basic");
    const config = loadConfigFile(configPath, program);
    const { appSettings, sources, serverSettings } = buildSettings(config, { serverRoot, serverHost, verbose, port }, auth);
    const settingsManager = new SettingsManager(appSettings, sources, {
      anchorPath,
      initialLoadTimeout: serverSettings.pageMustLoadTimeout,
      verbose,
      logger: LOGGER
    });
    createServer(serverSettings, createApp(serverSettings, settingsManager, version), program);
  });

program
  .command("run-examples")
  .addOption(portOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(verboseOption)
  .action(({ port, verbose, serverRoot, serverHost }) => {
    const configPath = path.join(__dirname, "../../config-examples.yaml");
    const anchorPath = path.dirname(configPath);
    const config = loadConfigFile(configPath, program);
    const { sources, serverSettings, appSettings } = buildSettings(config, { port, verbose, serverHost, serverRoot });
    const settingsManager = new SettingsManager(appSettings, sources, {
      anchorPath,
      initialLoadTimeout: serverSettings.pageMustLoadTimeout,
      verbose,
      logger: LOGGER
    });
    createServer(serverSettings, createApp(serverSettings, settingsManager, version), program);
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
    const { appSettings, serverSettings, sources } = settingsForDruidConnection(url, { port, verbose, serverHost, serverRoot }, auth);
    const settingsManager = new SettingsManager(appSettings, sources, {
      anchorPath: process.cwd(),
      initialLoadTimeout: serverSettings.pageMustLoadTimeout,
    const auth = parseCredentials(username, password, "http-basic");
      verbose,
      logger: LOGGER
    });
    createServer(serverSettings, createApp(serverSettings, settingsManager, version), program);
  });

program
  .command("load-file")
  .argument("<file>", "json file")
  .requiredOption("-t, --time-attribute <attribute>", "time attribute")
  .addOption(portOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(verboseOption)
  .action((file, { timeAttribute, port, verbose, serverHost, serverRoot }) => {
    const { appSettings, sources, serverSettings } = settingsForDatasetFile(file, timeAttribute, { serverRoot, serverHost, verbose, port });
    const settingsManager = new SettingsManager(appSettings, sources, {
      anchorPath: process.cwd(),
      initialLoadTimeout: serverSettings.pageMustLoadTimeout,
      verbose,
      logger: LOGGER
    });
    createServer(serverSettings, createApp(serverSettings, settingsManager, version), program);
  });

program
  .command("verify-config")
  .argument("<file>", "path to config file")
  .addOption(verboseOption)
  .action((file, { verbose }) => {
    try {
      const config = loadConfigFile(file, program);
      buildSettings(config, { verbose });
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
  .action((url, { verbose, username, password }) => {
    const { appSettings, serverSettings, sources } = settingsForDruidConnection(url, { verbose }, auth);
    printIntrospectedSettings(
      serverSettings,
      appSettings,
      sources,
      verbose,
      version
    ).catch((e: Error) => {
      program.error("There was an error generating a config: " + e.message);
    });
  });

program.showHelpAfterError();

program.parse();
