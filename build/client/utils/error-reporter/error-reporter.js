"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var browser_1 = require("@sentry/browser");
var isInitialised = false;
function reportError(error) {
    if (!isInitialised) {
        console.error(error);
        return null;
    }
    return browser_1.captureException(error);
}
exports.reportError = reportError;
function init(dsn, release) {
    browser_1.init({ dsn: dsn, release: release });
    isInitialised = true;
}
exports.init = init;
//# sourceMappingURL=error-reporter.js.map