"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
function stringFilterOptionsQuery(_a) {
    var essence = _a.essence, timekeeper = _a.timekeeper, limit = _a.limit, dimension = _a.dimension, searchText = _a.searchText;
    var dataCube = essence.dataCube;
    var nativeCount = dataCube.getMeasure("count");
    var $main = plywood_1.$("main");
    var measureExpression = nativeCount ? nativeCount.expression : $main.count();
    var filter = essence.getEffectiveFilter(timekeeper, { unfilterDimension: dimension }).toExpression(dataCube);
    var filterWithSearch = searchText ? filter.and(dimension.expression.contains(plywood_1.r(searchText), "ignoreCase")) : filter;
    return $main
        .filter(filterWithSearch)
        .split(dimension.expression, dimension.name)
        .apply("MEASURE", measureExpression)
        .sort(plywood_1.$("MEASURE"), plywood_1.SortExpression.DESCENDING)
        .limit(limit);
}
exports.stringFilterOptionsQuery = stringFilterOptionsQuery;
//# sourceMappingURL=selectable-string-filter-query.js.map