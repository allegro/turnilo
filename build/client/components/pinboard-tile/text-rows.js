"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var text_row_1 = require("./text-row");
exports.TextRows = function (props) {
    var data = props.data, dimension = props.dimension, onClick = props.onClick, formatter = props.formatter, searchText = props.searchText;
    return React.createElement(React.Fragment, null, data.map(function (datum) {
        var value = datum[dimension.name];
        var measure = formatter(datum);
        return React.createElement(text_row_1.TextRow, { key: String(value), value: value, onClick: onClick, measure: measure, searchText: searchText });
    }));
};
//# sourceMappingURL=text-rows.js.map