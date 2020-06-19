"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var time_shift_env_1 = require("../../../../common/models/time-shift/time-shift-env");
var query_1 = require("../../../../common/utils/canonical-length/query");
var time_filter_canonical_length_1 = require("../../../../common/utils/canonical-length/time-filter-canonical-length");
var functional_1 = require("../../../../common/utils/functional/functional");
var TOP_N = 100;
function filterExpression(_a) {
    var essence = _a.essence, searchText = _a.searchText, timekeeper = _a.timekeeper, dimension = _a.dimension;
    var expression = essence
        .getEffectiveFilter(timekeeper, { unfilterDimension: dimension })
        .toExpression(essence.dataCube);
    if (!searchText)
        return expression;
    return expression.and(dimension.expression.contains(plywood_1.r(searchText), "ignoreCase"));
}
function insertSortReferenceExpression(_a) {
    var essence = _a.essence, sortOn = _a.sortOn, timekeeper = _a.timekeeper;
    var sortSeries = essence.findConcreteSeries(sortOn.key);
    return function (query) {
        if (!sortSeries)
            return query;
        return query
            .apply(query_1.CANONICAL_LENGTH_ID, time_filter_canonical_length_1.default(essence, timekeeper))
            .performAction(sortSeries.plywoodExpression(0, { type: time_shift_env_1.TimeShiftEnvType.CURRENT }));
    };
}
function applySort(sortOn) {
    return function (query) { return query.sort(plywood_1.$(sortOn.key), plywood_1.SortExpression.DESCENDING); };
}
function limit(query) {
    return query.limit(TOP_N + 1);
}
function makeQuery(params) {
    var dimension = params.dimension, sortOn = params.sortOn;
    return functional_1.thread(plywood_1.$("main")
        .filter(filterExpression(params))
        .split(dimension.expression, dimension.name), insertSortReferenceExpression(params), applySort(sortOn), limit);
}
exports.makeQuery = makeQuery;
//# sourceMappingURL=make-query.js.map