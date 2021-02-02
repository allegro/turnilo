/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as bodyParser from "body-parser";
import * as compress from "compression";
import * as express from "express";
import { Handler, Request, Response, Router } from "express";
import { hsts } from "helmet";
import { join } from "path";
import { LOGGER } from "../common/logger/logger";
import { SERVER_SETTINGS, SETTINGS_MANAGER, VERSION } from "./config";
import { PluginSettings } from "./models/plugin-settings/plugin-settings";
import { livenessRouter } from "./routes/liveness/liveness";
import { mkurlRouter } from "./routes/mkurl/mkurl";
import { plyqlRouter } from "./routes/plyql/plyql";
import { plywoodRouter } from "./routes/plywood/plywood";
import { readinessRouter } from "./routes/readiness/readiness";
import { shortenRouter } from "./routes/shorten/shorten";
import { turniloRouter } from "./routes/turnilo/turnilo";
import { loadPlugin } from "./utils/plugin-loader/load-plugin";
import { SettingsGetter } from "./utils/settings-manager/settings-manager";
import { errorLayout } from "./views";

declare module "express" {
  export interface Request {
    turniloMetadata: object;
  }
}

let app = express();
app.disable("x-powered-by");

const isDev = app.get("env") === "development";
const isTrustedProxy = SERVER_SETTINGS.getTrustProxy() === "always";

if (isTrustedProxy) {
  app.set("trust proxy", true); // trust X-Forwarded-*, use left-most entry as the client
}

const timeout = SERVER_SETTINGS.getServerTimeout();
app.use((req, res, next) => {
  res.setTimeout(timeout);
  next();
});

function getRoutePath(route: string): string {
  const serverRoot = SERVER_SETTINGS.getServerRoot();
  const prefix = serverRoot.length > 0 ? `/${serverRoot}` : "";
  return `${prefix}${route}`;
}

function attachRouter(route: string, router: Router | Handler): void {
  app.use(getRoutePath(route), router);
}

// Add compression
app.use(compress());

// Add Strict Transport Security
if (SERVER_SETTINGS.getStrictTransportSecurity() === "always") {
  app.use(hsts({
    maxAge: 10886400000,     // Must be at least 18 weeks to be approved by Google
    includeSubdomains: true, // Must be enabled to be approved by Google
    preload: true
  }));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (SERVER_SETTINGS.getIframe() === "deny") {
  app.use((req: Request, res: Response, next: Function) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    next();
  });
}

app.use((req: Request, res: Response, next: Function) => {
  req.turniloMetadata = {};
  next();
});

const appSettings: SettingsGetter = opts => SETTINGS_MANAGER.getSettings(opts);

SERVER_SETTINGS.getPlugins().forEach(({ path, name, settings }: PluginSettings) => {
  try {
    LOGGER.log(`Loading plugin ${name} module`);
    const module = loadPlugin(path, SETTINGS_MANAGER.anchorPath);
    LOGGER.log(`Invoking plugin ${name}`);
    module.plugin(app, settings, SERVER_SETTINGS, appSettings, LOGGER.addPrefix(name));
  } catch (e) {
    LOGGER.warn(`Plugin ${name} threw an error: ${e.message}`);
  }
});

// development HMR
if (app.get("env") === "dev-hmr") {
  // add hot module replacement

  const webpack = require("webpack");
  const webpackConfig = require("../../config/webpack.dev");
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackHotMiddleware = require("webpack-hot-middleware");

  if (webpack && webpackDevMiddleware && webpackHotMiddleware) {
    const webpackCompiler = webpack(webpackConfig);

    app.use(webpackDevMiddleware(webpackCompiler, {
      hot: true,
      noInfo: true,
      publicPath: webpackConfig.output.publicPath
    }));

    app.use(webpackHotMiddleware(webpackCompiler, {
      log: console.log,
      path: "/__webpack_hmr"
    }));
  }
}

attachRouter("/", express.static(join(__dirname, "../../build/public")));
attachRouter("/", express.static(join(__dirname, "../../assets")));

attachRouter(SERVER_SETTINGS.getReadinessEndpoint(), readinessRouter(appSettings));
attachRouter(SERVER_SETTINGS.getLivenessEndpoint(), livenessRouter);

// Data routes
attachRouter("/plywood", plywoodRouter(SETTINGS_MANAGER));
attachRouter("/plyql", plyqlRouter(appSettings));
attachRouter("/mkurl", mkurlRouter(appSettings));
attachRouter("/shorten", shortenRouter(appSettings, isTrustedProxy));

const freshSettingsGetter: SettingsGetter = opts => SETTINGS_MANAGER.getFreshSettings(opts);
attachRouter("/", turniloRouter(freshSettingsGetter, VERSION));

// Catch 404 and redirect to /
app.use((req: Request, res: Response) => {
  res.redirect(getRoutePath("/"));
});

app.use((err: any, req: Request, res: Response, next: Function) => {
  LOGGER.error(`Server Error: ${err.message}`);
  LOGGER.error(err.stack);
  res.status(err.status || 500);
  // no stacktraces leaked to user
  const error = isDev ? err : null;
  res.send(errorLayout({ version: VERSION, title: "Error" }, err.message, error));
});

export default app;
