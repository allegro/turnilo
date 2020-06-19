"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var svg_icon_1 = require("../../../components/svg-icon/svg-icon");
var dom_1 = require("../../../utils/dom/dom");
require("./sort-arrow.scss");
var sortArrow = require("../../../icons/sort-arrow.svg");
exports.SortIcon = function (_a) {
    var direction = _a.direction;
    return React.createElement(svg_icon_1.SvgIcon, { svg: sortArrow, className: dom_1.classNames("sort-arrow", direction) });
};
//# sourceMappingURL=sort-icon.js.map