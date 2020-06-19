"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var combined_splits_title_1 = require("./combined-splits-title");
var split_columns_1 = require("./split-columns");
exports.SplitsHeader = function (_a) {
    var essence = _a.essence, collapseRows = _a.collapseRows;
    return collapseRows ?
        React.createElement(split_columns_1.SplitColumnsHeader, { essence: essence }) :
        React.createElement(combined_splits_title_1.CombinedSplitsTitle, { essence: essence });
};
//# sourceMappingURL=splits-header.js.map