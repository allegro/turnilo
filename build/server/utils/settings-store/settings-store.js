"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-promise");
var yaml = require("js-yaml");
var app_settings_1 = require("../../../common/models/app-settings/app-settings");
var general_1 = require("../../../common/utils/general/general");
function readSettingsFactory(filepath, format, inline) {
    if (inline === void 0) { inline = false; }
    return function () { return fs.readFile(filepath, "utf-8")
        .then(function (fileData) {
        switch (format) {
            case "json":
                return JSON.parse(fileData);
            case "yaml":
                return yaml.safeLoad(fileData);
            default:
                throw new Error("unsupported format '" + format + "'");
        }
    })
        .then(function (appSettingsJS) {
        if (inline)
            appSettingsJS = general_1.inlineVars(appSettingsJS, process.env);
        var appSettings = app_settings_1.AppSettings.fromJS(appSettingsJS, {});
        appSettings.validate();
        return appSettings;
    }); };
}
var SettingsStore = (function () {
    function SettingsStore() {
    }
    SettingsStore.fromTransient = function (initAppSettings) {
        var settingsStore = new SettingsStore();
        settingsStore.readSettings = function () { return Promise.resolve(initAppSettings); };
        return settingsStore;
    };
    SettingsStore.fromReadOnlyFile = function (filepath, format) {
        var settingsStore = new SettingsStore();
        settingsStore.readSettings = readSettingsFactory(filepath, format, true);
        return settingsStore;
    };
    return SettingsStore;
}());
exports.SettingsStore = SettingsStore;
//# sourceMappingURL=settings-store.js.map