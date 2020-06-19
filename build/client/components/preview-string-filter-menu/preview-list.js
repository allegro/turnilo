"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var filter_1 = require("../../../common/models/filter/filter");
var highlight_string_1 = require("../highlight-string/highlight-string");
require("./preview-list.scss");
var errorNotice = function (content) { return React.createElement("div", { className: "error-notice" }, content); };
exports.row = function (content, highlight) { return React.createElement("div", { className: "row no-select", key: content, title: content },
    React.createElement("div", { className: "row-wrapper" },
        React.createElement(highlight_string_1.HighlightString, { className: "label", text: content, highlight: highlight }))); };
function predicate(filterMode, searchText) {
    switch (filterMode) {
        case filter_1.FilterMode.CONTAINS:
            return function (d) { return String(d).includes(searchText); };
        case filter_1.FilterMode.REGEX:
            var escaped = searchText.replace(/\\[^\\]]/g, "\\\\");
            var regexp_1 = new RegExp(escaped);
            return function (d) { return regexp_1.test(String(d)); };
    }
}
function filterValues(list, filterMode, searchText) {
    if (!searchText)
        return list;
    return list.filter(predicate(filterMode, searchText));
}
exports.PreviewList = function (props) {
    var regexErrorMessage = props.regexErrorMessage, searchText = props.searchText, dataset = props.dataset, filterMode = props.filterMode, dimension = props.dimension, limit = props.limit;
    if (regexErrorMessage)
        return errorNotice(regexErrorMessage);
    var data = dataset.data;
    if (searchText && data.length === 0)
        return errorNotice("No results for \"" + searchText + "\"");
    var list = data.slice(0, limit).map(function (d) { return d[dimension.name]; });
    var filtered = filterValues(list, filterMode, searchText);
    return React.createElement(React.Fragment, null,
        searchText && React.createElement("div", { className: "matching-values-message" }, "Matching Values"),
        filtered.map(function (value) { return exports.row(String(value), searchText); }));
};
//# sourceMappingURL=preview-list.js.map