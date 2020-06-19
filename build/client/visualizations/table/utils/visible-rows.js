"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var table_1 = require("../table");
exports.VisibleRows = function (props) {
    var renderRow = props.renderRow, hoveredRowDatum = props.hoveredRowDatum, rowsData = props.rowsData, visibleRowsIndexRange = props.visibleRowsIndexRange, highlightedRowIndex = props.highlightedRowIndex;
    var start = visibleRowsIndexRange[0], end = visibleRowsIndexRange[1];
    var visibleData = rowsData.slice(start, end);
    return React.createElement(React.Fragment, null, visibleData.map(function (datum, i) {
        var index = start + i;
        var top = index * table_1.ROW_HEIGHT;
        var selected = index === highlightedRowIndex;
        var dimmed = !selected && highlightedRowIndex !== null;
        var hovered = datum === hoveredRowDatum;
        var highlight = selected || hovered;
        var rowProps = {
            highlight: highlight,
            dimmed: dimmed,
            top: top,
            index: index,
            datum: datum
        };
        return renderRow(rowProps);
    }));
};
//# sourceMappingURL=visible-rows.js.map