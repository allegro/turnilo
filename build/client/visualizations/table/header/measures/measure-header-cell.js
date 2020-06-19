"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../../../utils/dom/dom");
var sort_icon_1 = require("../../utils/sort-icon");
require("./measure-header-cell.scss");
exports.MeasureHeaderCell = function (_a) {
    var sort = _a.sort, width = _a.width, title = _a.title, className = _a.className;
    var sorted = sort !== null;
    return React.createElement("div", { className: dom_1.classNames("measure-header-cell", className, { sorted: sorted }), style: { width: width } },
        React.createElement("div", { className: "title-wrap" }, title),
        sort && React.createElement(sort_icon_1.SortIcon, { direction: sort }));
};
//# sourceMappingURL=measure-header-cell.js.map