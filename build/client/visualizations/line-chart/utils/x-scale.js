"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var d3 = require("d3");
var plywood_1 = require("plywood");
var range_1 = require("../../../../common/utils/plywood/range");
var highlight_clause_1 = require("../interactions/highlight-clause");
var splits_1 = require("./splits");
function createContinuousScale(essence, domainRange, width) {
    var continuousDimension = splits_1.getContinuousDimension(essence);
    var kind = continuousDimension.kind;
    var range = [0, width];
    switch (kind) {
        case "number": {
            var domain = [domainRange.start, domainRange.end];
            return d3.scale.linear().clamp(true).domain(domain).range(range);
        }
        case "time": {
            var domain = [domainRange.start, domainRange.end];
            return d3.time.scale().clamp(true).domain(domain).range(range);
        }
    }
}
exports.createContinuousScale = createContinuousScale;
function includeMaxTimeBucket(filterRange, maxTime, continuousSplit, timezone) {
    var continuousBucket = continuousSplit.bucket;
    if (maxTime && continuousBucket instanceof chronoshift_1.Duration) {
        var filterRangeEnd = filterRange.end;
        var filterRangeEndFloored = continuousBucket.floor(filterRangeEnd, timezone);
        var filterRangeEndCeiled = continuousBucket.shift(filterRangeEndFloored, timezone);
        if (filterRangeEndFloored < maxTime && maxTime < filterRangeEndCeiled) {
            return plywood_1.Range.fromJS({ start: filterRange.start, end: filterRangeEndCeiled });
        }
    }
    return filterRange;
}
function getFilterRange(essence, timekeeper) {
    var continuousSplit = splits_1.getContinuousSplit(essence);
    var effectiveFilter = essence.getEffectiveFilter(timekeeper);
    var continuousFilterClause = effectiveFilter.clauseForReference(continuousSplit.reference);
    if (!continuousFilterClause)
        return null;
    var filterRange = highlight_clause_1.toPlywoodRange(continuousFilterClause);
    var maxTime = essence.dataCube.getMaxTime(timekeeper);
    return includeMaxTimeBucket(filterRange, maxTime, continuousSplit, essence.timezone);
}
function safeRangeSum(a, b) {
    return (a && b) ? a.extend(b) : (a || b);
}
function getDatasetXRange(dataset, continuousDimension) {
    var continuousDimensionKey = continuousDimension.name;
    var flatDataset = dataset.flatten();
    return flatDataset
        .data
        .map(function (datum) { return datum[continuousDimensionKey]; })
        .reduce(safeRangeSum, null);
}
function calculateXRange(essence, timekeeper, dataset) {
    var continuousDimension = splits_1.getContinuousDimension(essence);
    var filterRange = getFilterRange(essence, timekeeper);
    var datasetRange = getDatasetXRange(dataset, continuousDimension);
    return range_1.union(filterRange, datasetRange);
}
exports.calculateXRange = calculateXRange;
//# sourceMappingURL=x-scale.js.map