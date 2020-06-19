"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
require("./heatmap-highlight-indicator.scss");
var RowHighlight = function (props) {
    var row = props.row, width = props.width, tileSize = props.tileSize;
    var top = row * tileSize;
    return React.createElement("div", { className: "heatmap-highlighter heatmap-highlighter-row", style: {
            top: top + "px",
            width: width + "px"
        } });
};
var ColumnHighlight = function (props) {
    var column = props.column, tileSize = props.tileSize, height = props.height, tileGap = props.tileGap;
    var left = column * tileSize + tileGap;
    return React.createElement("div", { className: "heatmap-highlighter heatmap-highlighter-column", style: {
            left: left + "px",
            height: height + "px"
        } });
};
exports.HeatmapHighlightIndicator = function (props) {
    var _a = props.position, row = _a.row, column = _a.column, width = props.width, height = props.height, tileGap = props.tileGap, tileSize = props.tileSize;
    return React.createElement(React.Fragment, null,
        row && React.createElement(RowHighlight, { row: row, width: width, tileSize: tileSize }),
        column && React.createElement(ColumnHighlight, { column: column, tileGap: tileGap, height: height, tileSize: tileSize }));
};
//# sourceMappingURL=heatmap-highlight-indicator.js.map