"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("../../utils/dom/dom");
var checkbox_1 = require("../checkbox/checkbox");
var highlight_string_1 = require("../highlight-string/highlight-string");
require("./string-value.scss");
var hasModKey = function (e) { return e.altKey || e.ctrlKey || e.metaKey; };
exports.StringValue = function (props) {
    var value = props.value, selected = props.selected, checkboxStyle = props.checkboxStyle, highlight = props.highlight, onRowSelect = props.onRowSelect;
    var label = String(value);
    return React.createElement("div", { className: dom_1.classNames("string-value", { selected: selected }), title: label, onClick: function (e) { return onRowSelect(value, hasModKey(e)); } },
        React.createElement("div", { className: "value-wrapper" },
            React.createElement(checkbox_1.Checkbox, { type: checkboxStyle, selected: selected }),
            React.createElement(highlight_string_1.HighlightString, { className: "label", text: label, highlight: highlight })));
};
//# sourceMappingURL=string-value.js.map