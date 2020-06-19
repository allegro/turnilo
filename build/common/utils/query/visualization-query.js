"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var constants_1 = require("../../../client/config/constants");
var split_1 = require("../../../common/models/split/split");
var filter_clause_1 = require("../../models/filter-clause/filter-clause");
var query_1 = require("../canonical-length/query");
var split_canonical_length_1 = require("../canonical-length/split-canonical-length");
var time_filter_canonical_length_1 = require("../canonical-length/time-filter-canonical-length");
var functional_1 = require("../functional/functional");
var $main = plywood_1.$("main");
function applySeries(series, timeShiftEnv, nestingLevel) {
    if (nestingLevel === void 0) { nestingLevel = 0; }
    return function (query) {
        return series.reduce(function (query, series) {
            return query.performAction(series.plywoodExpression(nestingLevel, timeShiftEnv));
        }, query);
    };
}
function applySort(sort) {
    return function (query) { return query.performAction(sort.toExpression()); };
}
function applyLimit(limit, dimension) {
    return function (query) {
        if (limit) {
            return query.performAction(new plywood_1.LimitExpression({ value: limit }));
        }
        if (dimension.kind === "number") {
            return query.limit(5000);
        }
        return query;
    };
}
function applySubSplit(nestingLevel, essence, timeShiftEnv) {
    return function (query) {
        if (nestingLevel >= essence.splits.length())
            return query;
        return query.apply(constants_1.SPLIT, applySplit(nestingLevel, essence, timeShiftEnv));
    };
}
function applyCanonicalLengthForTimeSplit(split, dataCube) {
    return function (exp) {
        var canonicalLength = split_canonical_length_1.default(split, dataCube);
        if (!canonicalLength)
            return exp;
        return exp.apply(query_1.CANONICAL_LENGTH_ID, canonicalLength);
    };
}
function applyDimensionFilter(dimension, filter) {
    return function (query) {
        if (!dimension.multiValue)
            return query;
        var filterClause = filter.clauseForReference(dimension.name);
        if (!filterClause)
            return query;
        return query.filter(filter_clause_1.toExpression(filterClause, dimension));
    };
}
function applySplit(index, essence, timeShiftEnv) {
    var splits = essence.splits, dataCube = essence.dataCube;
    var split = splits.getSplit(index);
    var dimension = dataCube.getDimension(split.reference);
    var sort = split.sort, limit = split.limit;
    if (!sort) {
        throw new Error("something went wrong during query generation");
    }
    var nestingLevel = index + 1;
    var currentSplit = split_1.toExpression(split, dimension, timeShiftEnv);
    return functional_1.thread($main.split(currentSplit, dimension.name), applyDimensionFilter(dimension, essence.filter), applyCanonicalLengthForTimeSplit(split, dataCube), applySeries(essence.getConcreteSeries(), timeShiftEnv, nestingLevel), applySort(sort), applyLimit(limit, dimension), applySubSplit(nestingLevel, essence, timeShiftEnv));
}
function makeQuery(essence, timekeeper) {
    var splits = essence.splits, dataCube = essence.dataCube;
    if (splits.length() > dataCube.getMaxSplits())
        throw new Error("Too many splits in query. DataCube \"" + dataCube.name + "\" supports only " + dataCube.getMaxSplits() + " splits");
    var hasComparison = essence.hasComparison();
    var mainFilter = essence.getEffectiveFilter(timekeeper, { combineWithPrevious: hasComparison });
    var timeShiftEnv = essence.getTimeShiftEnv(timekeeper);
    var mainExp = plywood_1.ply()
        .apply("main", $main.filter(mainFilter.toExpression(dataCube)))
        .apply(query_1.CANONICAL_LENGTH_ID, time_filter_canonical_length_1.default(essence, timekeeper));
    var queryWithMeasures = applySeries(essence.getConcreteSeries(), timeShiftEnv)(mainExp);
    if (splits.length() > 0) {
        return queryWithMeasures
            .apply(constants_1.SPLIT, applySplit(0, essence, timeShiftEnv));
    }
    return queryWithMeasures;
}
exports.default = makeQuery;
//# sourceMappingURL=visualization-query.js.map