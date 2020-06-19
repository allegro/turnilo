"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = require("d3");
exports.TICKS_COUNT = 5;
exports.TICK_WIDTH = 5;
function getScale(_a, height) {
    var min = _a[0], max = _a[1];
    if (isNaN(min) || isNaN(max)) {
        return null;
    }
    return d3.scale.linear()
        .domain([Math.min(min, 0), Math.max(max, 0)])
        .nice(exports.TICKS_COUNT)
        .range([height, 0]);
}
exports.default = getScale;
//# sourceMappingURL=y-scale.js.map