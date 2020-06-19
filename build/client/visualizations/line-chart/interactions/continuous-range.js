"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var plywood_1 = require("plywood");
function orderValues(a, b, timezone) {
    if (a > b)
        return [b, a];
    if (b > a)
        return [a, b];
    return [a, shiftByOne(a, timezone)];
}
function constructRange(a, b, timezone) {
    var _a = orderValues(a, b, timezone), start = _a[0], end = _a[1];
    return plywood_1.Range.fromJS({ start: start, end: end });
}
exports.constructRange = constructRange;
function shiftByOne(value, timezone) {
    return value instanceof Date ? chronoshift_1.second.shift(value, timezone, 1) : value + 1;
}
exports.shiftByOne = shiftByOne;
//# sourceMappingURL=continuous-range.js.map