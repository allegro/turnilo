"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var splits_1 = require("../utils/splits");
function roundTo(v, roundTo) {
    return Math.round(Math.floor(v / roundTo)) * roundTo;
}
function snapRangeToGrid(range, essence) {
    var continuousSplit = splits_1.getContinuousSplit(essence);
    if (plywood_1.TimeRange.isTimeRange(range)) {
        var timezone = essence.timezone;
        var duration = continuousSplit.bucket;
        return plywood_1.TimeRange.fromJS({
            start: duration.floor(range.start, timezone),
            end: duration.shift(duration.floor(range.end, timezone), timezone, 1)
        });
    }
    if (plywood_1.NumberRange.isNumberRange(range)) {
        var bucketSize = continuousSplit.bucket;
        var startFloored = roundTo(range.start, bucketSize);
        var endFloored = roundTo(range.end, bucketSize);
        if (endFloored - startFloored < bucketSize) {
            endFloored += bucketSize;
        }
        return plywood_1.NumberRange.fromJS({
            start: startFloored,
            end: endFloored
        });
    }
    return null;
}
exports.snapRangeToGrid = snapRangeToGrid;
//# sourceMappingURL=snap-range-to-grid.js.map