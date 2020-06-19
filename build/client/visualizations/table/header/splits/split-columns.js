"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var corner_1 = require("../../utils/corner");
require("./split-columns.scss");
exports.SplitColumnsHeader = function (_a) {
    var essence = _a.essence;
    var splits = essence.splits.splits, dataCube = essence.dataCube;
    return React.createElement(corner_1.Corner, null,
        React.createElement("div", { className: "header-split-columns" }, splits.toArray().map(function (split) {
            var reference = split.reference;
            var title = dataCube.getDimension(reference).title;
            return React.createElement("span", { className: "header-split-column", key: reference }, title);
        })));
};
//# sourceMappingURL=split-columns.js.map