"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var highlight_string_1 = require("../highlight-string/highlight-string");
var info_bubble_1 = require("../info-bubble/info-bubble");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./measure-item.scss");
exports.MEASURE_CLASS_NAME = "measure-item";
exports.MeasureItem = function (_a) {
    var title = _a.title, name = _a.name, measureDragStart = _a.measureDragStart, measureClick = _a.measureClick, description = _a.description, searchText = _a.searchText, approximate = _a.approximate, selected = _a.selected;
    var infoBubbleClassName = "measure-info-icon";
    var handleClick = function (e) {
        var target = e.target;
        if (target.classList && target.classList.contains(infoBubbleClassName))
            return;
        measureClick(name, e);
    };
    var handleDragStart = function (e) {
        measureDragStart(name, e);
    };
    return React.createElement("div", { className: dom_1.classNames(exports.MEASURE_CLASS_NAME, "row", { selected: selected }) },
        React.createElement("div", { className: "measure-item-name", onClick: handleClick, draggable: true, onDragStart: handleDragStart },
            React.createElement(highlight_string_1.HighlightString, { className: "label measure-item-label", text: title, highlight: searchText }),
            approximate && React.createElement(svg_icon_1.SvgIcon, { className: "approximate-measure-icon", svg: require("../../icons/approx.svg") })),
        description && React.createElement(info_bubble_1.InfoBubble, { className: infoBubbleClassName, description: description }));
};
//# sourceMappingURL=measure-item.js.map