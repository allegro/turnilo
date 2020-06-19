"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var compress = require("compression");
var express = require("express");
var helmet_1 = require("helmet");
var path = require("path");
var logger_1 = require("../common/logger/logger");
var config_1 = require("./config");
var liveness_1 = require("./routes/liveness/liveness");
var mkurl_1 = require("./routes/mkurl/mkurl");
var plyql_1 = require("./routes/plyql/plyql");
var plywood_1 = require("./routes/plywood/plywood");
var readiness_1 = require("./routes/readiness/readiness");
var shorten_1 = require("./routes/shorten/shorten");
var turnilo_1 = require("./routes/turnilo/turnilo");
var views_1 = require("./views");
var app = express();
app.disable("x-powered-by");
var isDev = app.get("env") === "development";
if (config_1.SERVER_SETTINGS.getTrustProxy() === "always") {
    app.set("trust proxy", 1);
}
function getRoutePath(route) {
    var serverRoot = config_1.SERVER_SETTINGS.getServerRoot();
    var prefix = serverRoot.length > 0 ? "/" + serverRoot : "";
    return "" + prefix + route;
}
function attachRouter(route, router) {
    app.use(getRoutePath(route), router);
}
app.use(compress());
if (config_1.SERVER_SETTINGS.getStrictTransportSecurity() === "always") {
    app.use(helmet_1.hsts({
        maxAge: 10886400000,
        includeSubdomains: true,
        preload: true
    }));
}
if (app.get("env") === "dev-hmr") {
    var webpack = require("webpack");
    var webpackConfig = require("../../config/webpack.dev");
    var webpackDevMiddleware = require("webpack-dev-middleware");
    var webpackHotMiddleware = require("webpack-hot-middleware");
    if (webpack && webpackDevMiddleware && webpackHotMiddleware) {
        var webpackCompiler = webpack(webpackConfig);
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
attachRouter("/", express.static(path.join(__dirname, "../../build/public")));
attachRouter("/", express.static(path.join(__dirname, "../../assets")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var settingsGetter = function (opts) { return config_1.SETTINGS_MANAGER.getSettings(opts); };
if (config_1.AUTH) {
    app.use(config_1.AUTH);
}
attachRouter(config_1.SERVER_SETTINGS.getReadinessEndpoint(), readiness_1.readinessRouter(settingsGetter));
attachRouter(config_1.SERVER_SETTINGS.getLivenessEndpoint(), liveness_1.livenessRouter);
attachRouter("/plywood", plywood_1.plywoodRouter(settingsGetter));
attachRouter("/plyql", plyql_1.plyqlRouter(settingsGetter));
attachRouter("/mkurl", mkurl_1.mkurlRouter(settingsGetter));
attachRouter("/shorten", shorten_1.shortenRouter(settingsGetter));
if (config_1.SERVER_SETTINGS.getIframe() === "deny") {
    app.use(function (req, res, next) {
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
        next();
    });
}
attachRouter("/", turnilo_1.turniloRouter(settingsGetter, config_1.VERSION));
app.use(function (req, res) {
    res.redirect(getRoutePath("/"));
});
app.use(function (err, req, res) {
    logger_1.LOGGER.error("Server Error: " + err.message);
    logger_1.LOGGER.error(err.stack);
    res.status(err.status || 500);
    var error = isDev ? err : null;
    res.send(views_1.errorLayout({ version: config_1.VERSION, title: "Error" }, err.message, error));
});
exports.default = app;
//# sourceMappingURL=app.js.map