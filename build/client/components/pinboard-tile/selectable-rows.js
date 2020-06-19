"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var selectable_row_1 = require("./selectable-row");
exports.SelectableRows = function (props) {
    var data = props.data, onSelect = props.onSelect, dimension = props.dimension, formatter = props.formatter, clause = props.clause, searchText = props.searchText;
    return React.createElement(React.Fragment, null, data.map(function (datum) {
        var value = datum[dimension.name];
        var measure = formatter(datum);
        var selected = clause.values.has(value);
        return React.createElement(selectable_row_1.SelectableRow, { key: String(value), value: value, selected: selected, onSelect: onSelect, measure: measure, searchText: searchText });
    }));
};
//# sourceMappingURL=selectable-rows.js.map