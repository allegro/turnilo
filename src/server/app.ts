/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
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
import * as path from "path";
import { LOGGER } from "../common/logger/logger";
import { GetSettingsOptions } from "../server/utils/settings-manager/settings-manager";
import { AUTH, SERVER_SETTINGS, SETTINGS_MANAGER, VERSION } from "./config";
import * as errorRoutes from "./routes/error/error";
import * as healthRoutes from "./routes/health/health";
import * as mkurlRoutes from "./routes/mkurl/mkurl";
import * as plyqlRoutes from "./routes/plyql/plyql";
import * as plywoodRoutes from "./routes/plywood/plywood";
import * as settingsRoutes from "./routes/settings/settings";
import * as swivRoutes from "./routes/swiv/swiv";
import { SwivRequest } from "./utils/index";
import { errorLayout } from "./views";

function makeGuard(guard: string): Handler {
  return (req: SwivRequest, res: Response, next: Function) => {
    const user = req.user;
    if (!user) {
      next(new Error("no user"));
      return;
    }

    const { allow } = user;
    if (!allow) {
      next(new Error("no user.allow"));
      return;
    }

    if (!allow[guard]) {
      next(new Error("not allowed"));
      return;
    }

    next();
  };
}

var app = express();
app.disable("x-powered-by");

if (SERVER_SETTINGS.getTrustProxy() === "always") {
  app.set("trust proxy", 1); // trust first proxy
}

function addRoutes(attach: string, router: Router | Handler): void {
  app.use(attach, router);
  app.use(SERVER_SETTINGS.getServerRoot() + attach, router);
}

function addGuardedRoutes(attach: string, guard: string, router: Router | Handler): void {
  var guardHandler = makeGuard(guard);
  app.use(attach, guardHandler, router);
  app.use(SERVER_SETTINGS.getServerRoot() + attach, guardHandler, router);
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

// development error handler and HMR

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

if (app.get("env") === "development") { // NODE_ENV
                                        // add hot module replacement

  // error handlers
  // will print stacktrace
  app.use((err: any, req: Request, res: Response, next: Function) => {
    LOGGER.error(`Server Error: ${err.message}`);
    LOGGER.error(err.stack);
    res.status(err.status || 500);
    res.send(errorLayout({ version: VERSION, title: "Error" }, err.message, err));
  });

}

addRoutes("/", express.static(path.join(__dirname, "../../build/public")));
addRoutes("/", express.static(path.join(__dirname, "../../assets")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Assign basics
var stateful = SETTINGS_MANAGER.isStateful();
app.use((req: SwivRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = VERSION;
  req.stateful = stateful;
  req.getSettings = (opts: GetSettingsOptions = {}) => {
    return SETTINGS_MANAGER.getSettings(opts);
  };
  next();
});

// Global, optional version check
app.use((req: SwivRequest, res: Response, next: Function) => {
  var { version } = req.body;
  if (version && version !== req.version) {
    res.status(412).send({
      error: "incorrect version",
      action: "reload"
    });
    return;
  }
  next();
});

// Auth
if (AUTH) {
  app.use(AUTH);
} else {
  app.use((req: SwivRequest, res: Response, next: Function) => {
    if (req.stateful) {
      req.user = {
        id: "admin",
        email: "admin@admin.com",
        displayName: "Admin",
        allow: {
          settings: true
        }
      };
    }
    next();
  });
}

addRoutes(SERVER_SETTINGS.getHealthEndpoint(), healthRoutes);

// Data routes
addRoutes("/plywood", plywoodRoutes);
addRoutes("/plyql", plyqlRoutes);
addRoutes("/mkurl", mkurlRoutes);
addRoutes("/error", errorRoutes);
if (stateful) {
  addGuardedRoutes("/settings", "settings", settingsRoutes);
}

// View routes
if (SERVER_SETTINGS.getIframe() === "deny") {
  app.use((req: Request, res: Response, next: Function) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    next();
  });
}

addRoutes("/", swivRoutes);

// Catch 404 and redirect to /
app.use((req: Request, res: Response, next: Function) => {
  res.redirect("/");
});

// production error handler
// no stacktraces leaked to user
app.use((err: any, req: Request, res: Response, next: Function) => {
  LOGGER.error(`Server Error: ${err.message}`);
  LOGGER.error(err.stack);
  res.status(err.status || 500);
  res.send(errorLayout({ version: VERSION, title: "Error" }, err.message));
});

export = app;
