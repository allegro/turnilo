"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./vis-selector-item.scss");
exports.VisSelectorItem = function (_a) {
    var visualization = _a.visualization, selected = _a.selected, onClick = _a.onClick;
    return React.createElement("div", { className: dom_1.classNames("vis-item", (selected ? "selected" : "not-selected")), key: visualization.name, onClick: function () { return onClick && !selected && onClick(visualization); } },
        React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/vis-" + visualization.name + ".svg") }),
        React.createElement("div", { className: "vis-title" }, visualization.title));
};
//# sourceMappingURL=vis-selector-item.js.map