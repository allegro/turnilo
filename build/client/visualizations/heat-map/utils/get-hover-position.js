"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getHoverPosition(xScale, yScale, x, y, part, _a) {
    var left = _a.left, top = _a.top;
    if (part !== "body")
        return null;
    var xOffset = x - left;
    var yOffset = y - top;
    var width = xScale.range()[1];
    var height = yScale.range()[0];
    if (xOffset > width || yOffset > height)
        return null;
    var column = Math.floor(xScale.invert(xOffset));
    var row = Math.floor(yScale.invert(yOffset));
    return {
        top: y,
        left: x,
        row: row,
        column: column
    };
}
exports.default = getHoverPosition;
//# sourceMappingURL=get-hover-position.js.map