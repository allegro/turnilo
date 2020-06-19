"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var highlight_string_1 = require("../highlight-string/highlight-string");
require("./text-row.scss");
exports.TextRow = function (props) {
    var measure = props.measure, value = props.value, searchText = props.searchText, onClick = props.onClick;
    var strValue = String(value);
    var clickable = !!onClick;
    return React.createElement("div", { className: dom_1.classNames("pinboard-text-row", { selectable: clickable }), onClick: function () { return clickable && onClick(value); } },
        React.createElement("div", { className: "segment-value", title: strValue },
            React.createElement(highlight_string_1.HighlightString, { className: "label", text: strValue, highlight: searchText })),
        measure && React.createElement("div", { className: "measure-value" }, measure));
};
//# sourceMappingURL=text-row.js.map