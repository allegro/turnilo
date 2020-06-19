"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var checkbox_1 = require("../checkbox/checkbox");
var highlight_string_1 = require("../highlight-string/highlight-string");
require("./selectable-row.scss");
exports.SelectableRow = function (props) {
    var measure = props.measure, value = props.value, selected = props.selected, searchText = props.searchText, onSelect = props.onSelect;
    var strValue = String(value);
    return React.createElement("div", { className: dom_1.classNames("pinboard-selectable-row", { selected: selected }), onClick: function () { return onSelect(value); } },
        React.createElement("div", { className: "segment-value", title: strValue },
            React.createElement(checkbox_1.Checkbox, { selected: selected, type: "check" }),
            React.createElement(highlight_string_1.HighlightString, { className: "label", text: strValue, highlight: searchText })),
        measure && React.createElement("div", { className: "measure-value" }, measure));
};
//# sourceMappingURL=selectable-row.js.map