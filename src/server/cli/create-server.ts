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
import { Command } from "commander";
import { Express } from "express";
import http from "http";
import { AddressInfo } from "net";
import { Logger } from "../../common/logger/logger";
import { ServerSettings } from "../models/server-settings/server-settings";

export default function createServer(serverSettings: ServerSettings, app: Express, logger: Logger, program: Command) {

  const server = http.createServer(app);

  server.on("error", (error: any) => {
    if (error.syscall !== "listen") {
      throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        program.error(`Port ${serverSettings.port} requires elevated privileges`);
        break;

      case "EADDRINUSE":
        program.error(`Port ${serverSettings.port} is already in use`);
        break;

      default:
        throw error;
    }
  });

  server.on("listening", () => {
    const address = server.address() as AddressInfo;
    logger.log(`Turnilo is listening on address ${address.address} port ${address.port}`);
  });

  app.set("port", serverSettings.port);
  server.listen(serverSettings.port, serverSettings.serverHost);
}
