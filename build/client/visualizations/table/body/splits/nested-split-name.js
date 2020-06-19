"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var formatter_1 = require("../../../../../common/utils/formatter/formatter");
function nestedSplitName(data, _a) {
    var timezone = _a.timezone, splits = _a.splits.splits;
    var nest = data.__nest;
    if (nest === 0)
        return "Total";
    var split = splits.get(nest - 1);
    var segmentValue = data[split.reference];
    return formatter_1.formatSegment(segmentValue, timezone);
}
exports.nestedSplitName = nestedSplitName;
//# sourceMappingURL=nested-split-name.js.map