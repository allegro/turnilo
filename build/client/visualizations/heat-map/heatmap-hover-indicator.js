"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
require("./heatmap-hover-indicator.scss");
exports.HeatmapHoverIndicator = function (_a) {
    var tileGap = _a.tileGap, tileSize = _a.tileSize, hoverPosition = _a.hoverPosition;
    var column = hoverPosition.column, row = hoverPosition.row;
    var top = row * tileSize;
    var left = column * tileSize + tileGap;
    var position = {
        top: top + "px",
        left: left + "px"
    };
    return React.createElement("div", { className: "heatmap-hover-indicator", style: position });
};
//# sourceMappingURL=heatmap-hover-indicator.js.map