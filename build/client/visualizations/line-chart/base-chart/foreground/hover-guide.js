"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
exports.HoverGuide = function (props) {
    var stage = props.stage, range = props.hover.range, yScale = props.yScale, xScale = props.xScale;
    var midpoint = range.midpoint();
    var x = xScale(midpoint);
    var _a = yScale.range(), y2 = _a[0], y1 = _a[1];
    return React.createElement("line", { transform: stage.getTransform(), x1: x, x2: x, y1: 0, y2: stage.height, className: "hover-guide" });
};
//# sourceMappingURL=hover-guide.js.map