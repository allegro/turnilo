"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
function union(first, second) {
    if (!plywood_1.Range.isRange(first) && !plywood_1.Range.isRange(second)) {
        return null;
    }
    if (!plywood_1.Range.isRange(first)) {
        return second;
    }
    if (!plywood_1.Range.isRange(second)) {
        return first;
    }
    return first.union(second);
}
exports.union = union;
//# sourceMappingURL=range.js.map