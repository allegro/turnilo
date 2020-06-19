"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var visible_rows_1 = require("../../utils/visible-rows");
var measure_row_1 = require("./measure-row");
exports.MeasureRows = function (props) {
    var rowWidth = props.rowWidth, essence = props.essence, cellWidth = props.cellWidth, hoverRow = props.hoverRow, scales = props.scales, data = props.data, visibleRowsIndexRange = props.visibleRowsIndexRange, highlightedRowIndex = props.highlightedRowIndex;
    return React.createElement(visible_rows_1.VisibleRows, { visibleRowsIndexRange: visibleRowsIndexRange, highlightedRowIndex: highlightedRowIndex, hoveredRowDatum: hoverRow, rowsData: data, renderRow: function (props) {
            var index = props.index, top = props.top, datum = props.datum, highlight = props.highlight, dimmed = props.dimmed;
            var rowStyle = { top: top, width: rowWidth };
            return React.createElement(measure_row_1.MeasureRow, { key: "row_" + index, essence: essence, highlight: highlight, dimmed: dimmed, style: rowStyle, datum: datum, cellWidth: cellWidth, scales: scales });
        } });
};
//# sourceMappingURL=measure-rows.js.map