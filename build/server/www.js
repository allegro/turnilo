"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var app_1 = require("./app");
var config_1 = require("./config");
if (config_1.START_SERVER) {
    var server = http.createServer(app_1.default);
    server.on("error", function (error) {
        if (error.syscall !== "listen") {
            throw error;
        }
        switch (error.code) {
            case "EACCES":
                console.error("Port " + config_1.SERVER_SETTINGS.getPort() + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error("Port " + config_1.SERVER_SETTINGS.getPort() + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
    server.on("listening", function () {
        var address = server.address();
        console.log("Turnilo is listening on address " + address.address + " port " + address.port);
    });
    app_1.default.set("port", config_1.SERVER_SETTINGS.getPort());
    server.listen(config_1.SERVER_SETTINGS.getPort(), config_1.SERVER_SETTINGS.getServerHost());
}
//# sourceMappingURL=www.js.map