"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var table_1 = require("../../table");
var visible_rows_1 = require("../../utils/visible-rows");
var nested_split_name_1 = require("./nested-split-name");
require("./nested-splits.scss");
var split_value_1 = require("./split-value");
exports.NestedSplits = function (props) {
    var essence = props.essence, data = props.data, highlightedRowIndex = props.highlightedRowIndex, hoverRow = props.hoverRow, visibleRowsIndexRange = props.visibleRowsIndexRange, segmentWidth = props.segmentWidth;
    return React.createElement("div", { className: "nested-splits-rows" },
        React.createElement(visible_rows_1.VisibleRows, { hoveredRowDatum: hoverRow, visibleRowsIndexRange: visibleRowsIndexRange, highlightedRowIndex: highlightedRowIndex, rowsData: data, renderRow: function (props) {
                var index = props.index, top = props.top, datum = props.datum, highlight = props.highlight, dimmed = props.dimmed;
                var nest = datum.__nest;
                var left = Math.max(0, nest - 1) * table_1.INDENT_WIDTH;
                var segmentStyle = { left: left, width: segmentWidth - left, top: top };
                return React.createElement(split_value_1.SplitValue, { key: "segment_" + index, highlight: highlight, dimmed: dimmed, style: segmentStyle }, nested_split_name_1.nestedSplitName(datum, essence));
            } }));
};
//# sourceMappingURL=nested-splits.js.map