"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var filter_1 = require("../../models/filter/filter");
function filterExpression(params) {
    var dimension = params.dimension, essence = params.essence, timekeeper = params.timekeeper, searchText = params.searchText, filterMode = params.filterMode;
    var dataCube = essence.dataCube;
    var filter = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression(dataCube);
    if (!searchText)
        return filter;
    switch (filterMode) {
        case filter_1.FilterMode.CONTAINS:
            return filter.and(dimension.expression.contains(plywood_1.r(searchText)));
        case filter_1.FilterMode.REGEX:
            return filter.and(dimension.expression.match(searchText));
    }
}
function previewStringFilterQuery(params) {
    var dimension = params.dimension, essence = params.essence, limit = params.limit;
    var dataCube = essence.dataCube;
    var nativeCount = dataCube.getMeasure("count");
    var measureExpression = nativeCount ? nativeCount.expression : plywood_1.$("main").count();
    return plywood_1.$("main")
        .filter(filterExpression(params))
        .split(dimension.expression, dimension.name)
        .apply("MEASURE", measureExpression)
        .sort(plywood_1.$("MEASURE"), plywood_1.SortExpression.DESCENDING)
        .limit(limit);
}
exports.previewStringFilterQuery = previewStringFilterQuery;
//# sourceMappingURL=preview-string-filter-query.js.map