"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var immutable_1 = require("immutable");
var plywood_1 = require("plywood");
var date_range_1 = require("../../models/date-range/date-range");
var essence_1 = require("../../models/essence/essence");
var filter_clause_1 = require("../../models/filter-clause/filter-clause");
var filter_1 = require("../../models/filter/filter");
var series_list_1 = require("../../models/series-list/series-list");
var sort_1 = require("../../models/sort/sort");
var split_1 = require("../../models/split/split");
var splits_1 = require("../../models/splits/splits");
var time_shift_1 = require("../../models/time-shift/time-shift");
var visualization_manifests_1 = require("../../visualization-manifests");
var ViewDefinitionConverter2 = (function () {
    function ViewDefinitionConverter2() {
        this.version = 2;
    }
    ViewDefinitionConverter2.prototype.fromViewDefinition = function (definition, dataCube) {
        var visualization = visualization_manifests_1.manifestByName(definition.visualization);
        var visualizationSettings = visualization.visualizationSettings.defaults;
        var measureNames = definition.multiMeasureMode ? definition.selectedMeasures : [definition.singleMeasure];
        var series = series_list_1.SeriesList.fromMeasures(dataCube.measures.getMeasuresByNames(measureNames));
        var timezone = definition.timezone && chronoshift_1.Timezone.fromJS(definition.timezone);
        var filter = filter_1.Filter.fromClauses(filterJSConverter(definition.filter, dataCube));
        var pinnedDimensions = immutable_1.OrderedSet(definition.pinnedDimensions);
        var splits = splits_1.Splits.fromSplits(splitJSConverter(definition.splits, dataCube));
        var timeShift = time_shift_1.TimeShift.empty();
        var pinnedSort = definition.pinnedSort;
        return new essence_1.Essence({
            dataCube: dataCube,
            visualization: visualization,
            visualizationSettings: visualizationSettings,
            timezone: timezone,
            filter: filter,
            timeShift: timeShift,
            splits: splits,
            pinnedDimensions: pinnedDimensions,
            series: series,
            pinnedSort: pinnedSort
        });
    };
    ViewDefinitionConverter2.prototype.toViewDefinition = function (essence) {
        throw new Error("toViewDefinition is not supported in Version 2");
    };
    return ViewDefinitionConverter2;
}());
exports.ViewDefinitionConverter2 = ViewDefinitionConverter2;
function isBooleanFilterSelection(selection) {
    return selection instanceof plywood_1.LiteralExpression && selection.type === "SET/BOOLEAN";
}
function isNumberFilterSelection(selection) {
    return selection instanceof plywood_1.LiteralExpression && selection.type === "SET/NUMBER_RANGE";
}
function isFixedTimeRangeSelection(selection) {
    return selection instanceof plywood_1.LiteralExpression && selection.type === "TIME_RANGE";
}
function isRelativeTimeRangeSelection(selection) {
    return selection instanceof plywood_1.TimeRangeExpression || selection instanceof plywood_1.TimeBucketExpression;
}
function filterJSConverter(filter, dataCube) {
    var filterExpression = plywood_1.Expression.fromJSLoose(filter);
    if (filterExpression instanceof plywood_1.LiteralExpression && filterExpression.simple)
        return [];
    if (filterExpression instanceof plywood_1.AndExpression) {
        return filterExpression.getExpressionList().map(function (exp) { return convertFilterExpression(exp, dataCube); });
    }
    else {
        return [convertFilterExpression(filterExpression, dataCube)];
    }
}
var SupportedAction;
(function (SupportedAction) {
    SupportedAction["overlap"] = "overlap";
    SupportedAction["contains"] = "contains";
    SupportedAction["match"] = "match";
})(SupportedAction || (SupportedAction = {}));
function readBooleanFilterClause(selection, dimension, not) {
    var reference = dimension.name;
    return new filter_clause_1.BooleanFilterClause({ reference: reference, values: immutable_1.Set(selection.value.elements), not: not });
}
function readNumberFilterClause(selection, dimension, not) {
    var reference = dimension.name;
    if (isNumberFilterSelection(selection) && selection.value instanceof plywood_1.Set) {
        var values = immutable_1.List(selection.value.elements.map(function (range) { return new filter_clause_1.NumberRange(range); }));
        return new filter_clause_1.NumberFilterClause({ reference: reference, not: not, values: values });
    }
    else {
        throw new Error("Number filterClause expected, found: " + selection + ". Dimension: " + reference);
    }
}
function readFixedTimeFilter(selection, dimension) {
    var reference = dimension.name;
    return new filter_clause_1.FixedTimeFilterClause({ reference: reference, values: immutable_1.List.of(new date_range_1.DateRange(selection.value)) });
}
function readRelativeTimeFilterClause(_a, dimension) {
    var step = _a.step, duration = _a.duration, operand = _a.operand;
    var reference = dimension.name;
    if (operand instanceof plywood_1.TimeFloorExpression) {
        return new filter_clause_1.RelativeTimeFilterClause({
            reference: reference,
            duration: duration.multiply(Math.abs(step)),
            period: filter_clause_1.TimeFilterPeriod.PREVIOUS
        });
    }
    return new filter_clause_1.RelativeTimeFilterClause({
        reference: reference,
        period: step ? filter_clause_1.TimeFilterPeriod.LATEST : filter_clause_1.TimeFilterPeriod.CURRENT,
        duration: step ? duration.multiply(Math.abs(step)) : duration
    });
}
function readStringFilterClause(selection, dimension, exclude) {
    var action = expressionAction(selection);
    var reference = dimension.name;
    switch (action) {
        case SupportedAction.contains:
            return new filter_clause_1.StringFilterClause({
                reference: reference,
                action: filter_clause_1.StringFilterAction.CONTAINS,
                values: immutable_1.Set.of(selection.expression.value),
                not: exclude
            });
        case SupportedAction.match:
            return new filter_clause_1.StringFilterClause({
                reference: reference,
                action: filter_clause_1.StringFilterAction.MATCH,
                values: immutable_1.Set.of(selection.regexp),
                not: exclude
            });
        case SupportedAction.overlap:
        case undefined:
        default:
            return new filter_clause_1.StringFilterClause({
                reference: reference,
                action: filter_clause_1.StringFilterAction.IN,
                values: immutable_1.Set(selection.expression.value.elements),
                not: exclude
            });
    }
}
function extractExclude(expression) {
    if (expression instanceof plywood_1.NotExpression) {
        return { exclude: true, expression: expression.operand };
    }
    return { exclude: false, expression: expression };
}
function expressionAction(expression) {
    if (expression instanceof plywood_1.InExpression || expression instanceof plywood_1.OverlapExpression || expression instanceof plywood_1.ContainsExpression) {
        return expression.op;
    }
    if (expression instanceof plywood_1.MatchExpression) {
        return SupportedAction.match;
    }
    throw new Error("Unrecognized Supported Action for expression " + expression);
}
function convertFilterExpression(filter, dataCube) {
    var _a = extractExclude(filter), expression = _a.expression, exclude = _a.exclude;
    var dimension = dataCube.getDimensionByExpression(expression.operand);
    if (isBooleanFilterSelection(expression.expression)) {
        return readBooleanFilterClause(expression.expression, dimension, exclude);
    }
    else if (isNumberFilterSelection(expression.expression)) {
        return readNumberFilterClause(expression.expression, dimension, exclude);
    }
    else if (isFixedTimeRangeSelection(expression.expression)) {
        return readFixedTimeFilter(expression.expression, dimension);
    }
    else if (isRelativeTimeRangeSelection(expression.expression)) {
        return readRelativeTimeFilterClause(expression.expression, dimension);
    }
    else {
        return readStringFilterClause(expression, dimension, exclude);
    }
}
function limitValue(limitAction) {
    return limitAction.value || limitAction.limit;
}
function isTimeBucket(action) {
    return action.op === "timeBucket" || action.action === "timeBucket";
}
function createSort(sortAction, dataCube) {
    if (!sortAction)
        return null;
    var reference = sortAction.expression.name;
    var direction = sortAction.direction;
    if (dataCube.getDimension(sortAction.expression.name)) {
        return new sort_1.DimensionSort({ reference: reference, direction: direction });
    }
    return new sort_1.SeriesSort({ reference: reference, direction: direction });
}
function convertSplit(split, dataCube) {
    var sortAction = split.sortAction, limitAction = split.limitAction, bucketAction = split.bucketAction;
    var expression = plywood_1.Expression.fromJS(split.expression);
    var dimension = dataCube.getDimensionByExpression(expression);
    var reference = dimension.name;
    var sort = createSort(sortAction, dataCube);
    var type = split_1.kindToType(dimension.kind);
    var limit = limitAction && limitValue(limitAction);
    var bucket = bucketAction && (isTimeBucket(bucketAction) ? chronoshift_1.Duration.fromJS(bucketAction.duration) : bucketAction.size);
    return new split_1.Split({ type: type, reference: reference, sort: sort, limit: limit, bucket: bucket });
}
function splitJSConverter(splits, dataCube) {
    return splits.map(function (split) { return convertSplit(split, dataCube); });
}
exports.default = splitJSConverter;
//# sourceMappingURL=view-definition-converter-2.js.map