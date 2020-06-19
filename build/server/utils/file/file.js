"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var yaml = require("js-yaml");
function loadFileSync(filepath, postProcess) {
    if (postProcess === void 0) { postProcess = null; }
    var fileData = fs.readFileSync(filepath, "utf-8");
    if (postProcess === "json") {
        fileData = JSON.parse(fileData);
    }
    else if (postProcess === "yaml") {
        fileData = yaml.safeLoad(fileData);
    }
    return fileData;
}
exports.loadFileSync = loadFileSync;
//# sourceMappingURL=file.js.map