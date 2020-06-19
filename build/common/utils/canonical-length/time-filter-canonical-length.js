"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
function timeFilterCanonicalLength(essence, timekeeper) {
    var currentTimeFilter = essence.currentTimeFilter(timekeeper);
    var _a = currentTimeFilter.values.get(0), start = _a.start, end = _a.end;
    var currentTimeRange = new chronoshift_1.Duration(start, end, essence.timezone);
    return currentTimeRange.getCanonicalLength();
}
exports.default = timeFilterCanonicalLength;
//# sourceMappingURL=time-filter-canonical-length.js.map