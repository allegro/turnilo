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

import { program } from "commander";
import path from "path";
import buildSettings, { settingsForDatasetFile, settingsForDruidConnection } from "./cli/build-settings";
import printIntrospectedSettings from "./cli/introspect-cluster";
import { loadConfigFile } from "./cli/load-config-file";
import {
  loggerOption,
  passwordOption,
  portOption,
  serverHostOption,
  serverRootOption,
  usernameOption,
  verboseOption
} from "./cli/options";
import runTurnilo from "./cli/run-turnilo";
import { parseCredentials } from "./cli/utils";
import { readVersion } from "./version";

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
  .description("Runs Turnilo using config file")
  .argument("<config-path>", "Path to config file")
  .addOption(portOption)
  .addOption(loggerOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(usernameOption)
  .addOption(passwordOption)
  .addOption(verboseOption)
  .action((configPath, { username, password, loggerFormat, serverRoot, serverHost, port, verbose }) => {
    const anchorPath = path.dirname(configPath);
    const auth = parseCredentials(username, password, "http-basic");
    const config = loadConfigFile(configPath, program);
    const options = {
      loggerFormat,
      serverRoot,
      serverHost,
      verbose,
      port
    };

    runTurnilo(
      buildSettings(config, options, auth),
      anchorPath,
      verbose,
      version,
      program
    );
  });

program
  .command("run-examples")
  .description("Runs Turnilo with example datasets")
  .addOption(portOption)
  .addOption(loggerOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(verboseOption)
  .action(({ port, verbose, loggerFormat, serverRoot, serverHost }) => {
    const configPath = path.join(__dirname, "../../config-examples.yaml");
    const anchorPath = path.dirname(configPath);
    const config = loadConfigFile(configPath, program);
    const options = { port, verbose, serverHost, serverRoot, loggerFormat };

    runTurnilo(
      buildSettings(config, options),
      anchorPath,
      verbose,
      version,
      program
    );
  });

program
  .command("connect-druid")
  .description("Runs turnilo that connects to Druid cluster and introspects it for datasets")
  .argument("<druid-url>", "Url of Druid cluster")
  .addOption(portOption)
  .addOption(loggerOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(verboseOption)
  .addOption(usernameOption)
  .addOption(passwordOption)
  .action((url, { port, verbose, username, password, serverRoot, serverHost, loggerFormat }) => {
    const auth = parseCredentials(username, password, "http-basic");
    const options = { port, verbose, serverHost, serverRoot, loggerFormat };
    runTurnilo(
      settingsForDruidConnection(url, options, auth),
      process.cwd(),
      verbose,
      version,
      program
    );
  });

program
  .command("load-file")
  .description("Runs Turnilo and loads json file as a dataset")
  .argument("<file-path>", "Path to json file with data")
  .requiredOption("-t, --time-attribute <field-name>", "JSON field name with time column")
  .addOption(portOption)
  .addOption(loggerOption)
  .addOption(serverRootOption)
  .addOption(serverHostOption)
  .addOption(verboseOption)
  .action((file, { timeAttribute, port, verbose, serverHost, serverRoot, loggerFormat }) => {
    const options = {
      loggerFormat,
      serverRoot,
      serverHost,
      verbose,
      port
    };
    runTurnilo(
      settingsForDatasetFile(file, timeAttribute, options),
      process.cwd(),
      verbose,
      version,
      program
    );
  });

program
  .command("verify-config")
  .description("Runs verification of provided config file")
  .argument("<file-path>", "Path to config file to verify")
  .addOption(verboseOption)
  .action((file, { verbose }) => {
    try {
      const config = loadConfigFile(file, program);
      buildSettings(config, { verbose });
    } catch (e) {
      program.error(`Config verification error: ${e.message}`);
    }
  });

program
  .command("introspect-druid")
  .description("Connects to Druid cluster and prints introspected data in config file format")
  .argument("<druid-url>", "Url of Druid cluster")
  .addOption(verboseOption)
  .addOption(usernameOption)
  .addOption(passwordOption)
  .action((url, { verbose, username, password }) => {
    const auth = parseCredentials(username, password, "http-basic");
    printIntrospectedSettings(
      settingsForDruidConnection(url, { verbose }, auth),
      verbose,
      version
    ).catch((e: Error) => {
        program.error(`There was an error generating a config: ${e.message}`);
      });
  });

program.parse();
