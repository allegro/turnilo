"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var highlight_string_1 = require("../highlight-string/highlight-string");
var info_bubble_1 = require("../info-bubble/info-bubble");
var svg_icon_1 = require("../svg-icon/svg-icon");
require("./dimension-item.scss");
exports.DIMENSION_CLASS_NAME = "dimension";
exports.DimensionItem = function (_a) {
    var name = _a.name, title = _a.title, dimensionClick = _a.dimensionClick, dimensionDragStart = _a.dimensionDragStart, description = _a.description, classSuffix = _a.classSuffix, searchText = _a.searchText, selected = _a.selected;
    var infoBubbleClassName = "info-icon";
    var className = dom_1.classNames(exports.DIMENSION_CLASS_NAME, "type-" + classSuffix, { selected: selected });
    var handleClick = function (e) {
        var target = e.currentTarget;
        if (target.classList && target.classList.contains(infoBubbleClassName))
            return;
        dimensionClick(name, e);
    };
    var handleDragStart = function (e) {
        dimensionDragStart(name, e);
    };
    return React.createElement("div", { className: className, key: name, draggable: true, onDragStart: handleDragStart },
        React.createElement("div", { className: "label-icon-container", onClick: handleClick },
            React.createElement("div", { className: "icon" },
                React.createElement(svg_icon_1.SvgIcon, { svg: require("../../icons/dim-" + classSuffix + ".svg") })),
            React.createElement(highlight_string_1.HighlightString, { className: "label", text: title, highlight: searchText })),
        description && React.createElement(info_bubble_1.InfoBubble, { className: infoBubbleClassName, description: description }));
};
//# sourceMappingURL=dimension-item.js.map