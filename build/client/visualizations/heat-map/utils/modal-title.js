"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var formatter_1 = require("../../../../common/utils/formatter/formatter");
var functional_1 = require("../../../../common/utils/functional/functional");
var datum_by_position_1 = require("./datum-by-position");
function modalTitle(position, dataset, essence) {
    var timezone = essence.timezone, splits = essence.splits.splits;
    var datums = datum_by_position_1.default(dataset, position);
    var references = splits.toArray().map(function (split) { return split.reference; });
    var segments = functional_1.zip(datums, references);
    return segments
        .filter(function (_a) {
        var datum = _a[0];
        return datum;
    })
        .map(function (_a) {
        var datum = _a[0], split = _a[1];
        return formatter_1.formatSegment(datum[split], timezone);
    })
        .join(" - ");
}
exports.modalTitle = modalTitle;
//# sourceMappingURL=modal-title.js.map