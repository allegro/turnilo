"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
require("./measure-cell.scss");
exports.MeasureCell = function (props) {
    var width = props.width, value = props.value, children = props.children;
    return React.createElement("div", { className: "measure-cell", style: { width: width } },
        children,
        React.createElement("div", { className: "measure-label" }, value));
};
//# sourceMappingURL=measure-cell.js.map