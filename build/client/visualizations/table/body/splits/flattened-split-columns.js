"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var formatter_1 = require("../../../../../common/utils/formatter/formatter");
require("./flattened-split-columns.scss");
exports.FlattenedSplitColumns = function (_a) {
    var splits = _a.splits, datum = _a.datum, timezone = _a.timezone;
    return React.createElement(React.Fragment, null, splits.map(function (split) {
        var reference = split.reference;
        var value = datum[reference];
        return React.createElement("div", { key: reference, className: "flattened-split-value" }, formatter_1.formatSegment(value, timezone));
    }));
};
//# sourceMappingURL=flattened-split-columns.js.map