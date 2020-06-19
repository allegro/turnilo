"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MAX_HOVER_DIST = 50;
var plywood_1 = require("plywood");
var dataset_1 = require("../utils/dataset");
var splits_1 = require("../utils/splits");
function findClosest(data, value, scaleX, continuousDimension) {
    var closestDatum = null;
    var minDist = Infinity;
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var datum = data_1[_i];
        var continuousSegmentValue = datum[continuousDimension.name];
        if (!continuousSegmentValue || !plywood_1.Range.isRange(continuousSegmentValue))
            continue;
        var mid = continuousSegmentValue.midpoint();
        var dist = Math.abs(mid.valueOf() - value.valueOf());
        var distPx = Math.abs(scaleX(mid) - scaleX(value));
        if ((!closestDatum || dist < minDist) && distPx < MAX_HOVER_DIST) {
            closestDatum = datum;
            minDist = dist;
        }
    }
    return closestDatum;
}
function findClosestDatum(value, essence, dataset, xScale) {
    var continuousDimension = splits_1.getContinuousDimension(essence);
    if (splits_1.hasNominalSplit(essence)) {
        var flattened = dataset_1.selectFirstSplitDataset(dataset).flatten();
        return findClosest(flattened.data, value, xScale, continuousDimension);
    }
    return findClosest(dataset_1.selectFirstSplitDatums(dataset), value, xScale, continuousDimension);
}
exports.findClosestDatum = findClosestDatum;
//# sourceMappingURL=find-closest-datum.js.map