"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var table_1 = require("../../table");
var visible_rows_1 = require("../../utils/visible-rows");
var flattened_split_columns_1 = require("./flattened-split-columns");
require("./flattened-splits.scss");
var split_value_1 = require("./split-value");
exports.FlattenedSplits = function (props) {
    var essence = props.essence, data = props.data, highlightedRowIndex = props.highlightedRowIndex, hoverRow = props.hoverRow, visibleRowsIndexRange = props.visibleRowsIndexRange, segmentWidth = props.segmentWidth;
    var splits = essence.splits.splits, timezone = essence.timezone;
    return React.createElement("div", { className: "flattened-splits-rows" },
        React.createElement(visible_rows_1.VisibleRows, { visibleRowsIndexRange: visibleRowsIndexRange, highlightedRowIndex: highlightedRowIndex, rowsData: data, hoveredRowDatum: hoverRow, renderRow: function (props) {
                var index = props.index, top = props.top, datum = props.datum, highlight = props.highlight, dimmed = props.dimmed;
                var segmentStyle = { width: segmentWidth - table_1.SPACE_LEFT, top: top };
                return React.createElement(split_value_1.SplitValue, { key: "splits_" + index, className: "flattened-splits-row", style: segmentStyle, dimmed: dimmed, highlight: highlight },
                    React.createElement(flattened_split_columns_1.FlattenedSplitColumns, { splits: splits, datum: datum, timezone: timezone }));
            } }));
};
//# sourceMappingURL=flattened-splits.js.map