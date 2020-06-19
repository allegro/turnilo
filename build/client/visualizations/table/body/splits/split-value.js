"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../../../utils/dom/dom");
require("./split-value.scss");
exports.SplitValue = function (_a) {
    var className = _a.className, highlight = _a.highlight, dimmed = _a.dimmed, children = _a.children, style = _a.style;
    return React.createElement("div", { className: dom_1.classNames("split-value", className, { dimmed: dimmed, highlight: highlight }), style: style }, children);
};
//# sourceMappingURL=split-value.js.map