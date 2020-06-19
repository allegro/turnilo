"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var corner_1 = require("../../utils/corner");
exports.CombinedSplitsTitle = function (_a) {
    var essence = _a.essence;
    var splits = essence.splits, dataCube = essence.dataCube;
    var title = splits.splits.map(function (split) { return dataCube.getDimension(split.reference).title; }).join(", ");
    return React.createElement(corner_1.Corner, null, title);
};
//# sourceMappingURL=combined-splits-title.js.map