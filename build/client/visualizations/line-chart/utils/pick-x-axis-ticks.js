"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3_1 = require("d3");
var plywood_1 = require("plywood");
var granularity_1 = require("../../../../common/models/granularity/granularity");
function generateDateTicks(bucket, start, end, timezone) {
    return bucket.materialize(start, end, timezone);
}
function generateNumberTicks(bucket, start, end) {
    var sequence = d3_1.range(start, end, bucket);
    return sequence.concat([end]);
}
function pickXAxisTicks(_a, timezone) {
    var start = _a[0], end = _a[1];
    if (start instanceof Date && end instanceof Date) {
        var bucket = granularity_1.getBestBucketUnitForRange(plywood_1.TimeRange.fromJS({ start: start, end: end }), true);
        return generateDateTicks(bucket, start, end, timezone);
    }
    if (typeof start === "number" && typeof end === "number") {
        var bucket = granularity_1.getBestBucketUnitForRange(plywood_1.NumberRange.fromJS({ start: start, end: end }), true);
        return generateNumberTicks(bucket, start, end);
    }
    throw new Error("Expected domain to be continuous. Got [" + start + ", " + end + "]");
}
exports.default = pickXAxisTicks;
//# sourceMappingURL=pick-x-axis-ticks.js.map