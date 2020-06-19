"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowDataCubesHeaderName = "x-turnilo-allow-datacubes";
function checkAccess(dataCube, headers) {
    var guard = dataCube && dataCube.cluster && dataCube.cluster.guardDataCubes || false;
    if (!guard) {
        return true;
    }
    if (!(exports.allowDataCubesHeaderName in headers)) {
        return false;
    }
    var allowed_datasources = headers[exports.allowDataCubesHeaderName].split(",");
    return allowed_datasources.indexOf("*") > -1 || allowed_datasources.indexOf(dataCube.name) > -1;
}
exports.checkAccess = checkAccess;
//# sourceMappingURL=datacube-guard.js.map