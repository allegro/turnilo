"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var filter_1 = require("../../../common/models/filter/filter");
var string_value_1 = require("./string-value");
require("./string-values-list.scss");
function filterRows(rows, searchText) {
    if (!searchText)
        return rows;
    var searchTextLower = searchText.toLowerCase();
    return rows.filter(function (d) { return String(d).toLowerCase().indexOf(searchTextLower) !== -1; });
}
function sortRows(rows, promoted) {
    return rows.sort(function (a, b) {
        if (promoted.has(a) && !promoted.has(b))
            return -1;
        if (!promoted.has(a) && promoted.has(b))
            return 1;
        return 0;
    });
}
exports.StringValuesList = function (props) {
    var onRowSelect = props.onRowSelect, filterMode = props.filterMode, dataset = props.dataset, dimension = props.dimension, searchText = props.searchText, limit = props.limit, promotedValues = props.promotedValues, selectedValues = props.selectedValues;
    var rows = dataset.data.slice(0, limit).map(function (d) { return d[dimension.name]; });
    var matchingRows = filterRows(rows, searchText);
    if (searchText && matchingRows.length === 0) {
        return React.createElement("div", { className: "no-string-values" }, "No results for \"" + searchText + "\"");
    }
    var sortedRows = sortRows(matchingRows, promotedValues);
    var checkboxStyle = filterMode === filter_1.FilterMode.EXCLUDE ? "cross" : "check";
    return React.createElement(React.Fragment, null, sortedRows.map(function (value) { return (React.createElement(string_value_1.StringValue, { key: String(value), value: value, onRowSelect: onRowSelect, selected: selectedValues && selectedValues.contains(value), checkboxStyle: checkboxStyle, highlight: searchText })); }));
};
//# sourceMappingURL=string-values-list.js.map