"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plywood_1 = require("plywood");
var constants_1 = require("../../../client/config/constants");
var date_range_1 = require("../../models/date-range/date-range");
var filter_clause_1 = require("../../models/filter-clause/filter-clause");
var time_1 = require("../time/time");
function formatNumberRange(value) {
    return formatValue(value.start || "any") + " to " + formatValue(value.end || "any");
}
exports.formatNumberRange = formatNumberRange;
function formatValue(value, timezone) {
    if (plywood_1.NumberRange.isNumberRange(value)) {
        return formatNumberRange(value);
    }
    else if (plywood_1.TimeRange.isTimeRange(value)) {
        return time_1.formatTimeRange(new date_range_1.DateRange(value), timezone);
    }
    else {
        return "" + value;
    }
}
exports.formatValue = formatValue;
function formatSegment(value, timezone) {
    if (plywood_1.TimeRange.isTimeRange(value)) {
        return time_1.formatStartOfTimeRange(value, timezone);
    }
    else if (plywood_1.NumberRange.isNumberRange(value)) {
        return formatNumberRange(value);
    }
    return String(value);
}
exports.formatSegment = formatSegment;
function formatFilterClause(dimension, clause, timezone) {
    var _a = getFormattedClause(dimension, clause, timezone), title = _a.title, values = _a.values;
    return title ? title + " " + values : values;
}
exports.formatFilterClause = formatFilterClause;
function getFormattedStringClauseValues(_a) {
    var values = _a.values, action = _a.action;
    switch (action) {
        case filter_clause_1.StringFilterAction.MATCH:
            return "/" + values.first() + "/";
        case filter_clause_1.StringFilterAction.CONTAINS:
            return "\"" + values.first() + "\"";
        case filter_clause_1.StringFilterAction.IN:
            return values.count() > 1 ? "(" + values.count() + ")" : values.first();
    }
}
function getFormattedBooleanClauseValues(_a) {
    var values = _a.values;
    return values.count() > 1 ? "(" + values.count() + ")" : values.first().toString();
}
function getFormattedNumberClauseValues(clause) {
    var _a = clause.values.first(), start = _a.start, end = _a.end;
    return start + " to " + end;
}
function getFilterClauseValues(clause, timezone) {
    if (filter_clause_1.isTimeFilter(clause)) {
        return getFormattedTimeClauseValues(clause, timezone);
    }
    if (clause instanceof filter_clause_1.StringFilterClause) {
        return getFormattedStringClauseValues(clause);
    }
    if (clause instanceof filter_clause_1.BooleanFilterClause) {
        return getFormattedBooleanClauseValues(clause);
    }
    if (clause instanceof filter_clause_1.NumberFilterClause) {
        return getFormattedNumberClauseValues(clause);
    }
    throw new Error("Unknown Filter Clause: " + clause);
}
function getClauseLabel(clause, dimension) {
    var dimensionTitle = dimension.title;
    if (filter_clause_1.isTimeFilter(clause))
        return "";
    var delimiter = clause instanceof filter_clause_1.StringFilterClause && [filter_clause_1.StringFilterAction.MATCH, filter_clause_1.StringFilterAction.CONTAINS].indexOf(clause.action) !== -1 ? " ~" : ":";
    var clauseValues = clause.values;
    if (clauseValues && clauseValues.count() > 1)
        return "" + dimensionTitle;
    return "" + dimensionTitle + delimiter;
}
function getFormattedClause(dimension, clause, timezone) {
    return { title: getClauseLabel(clause, dimension), values: getFilterClauseValues(clause, timezone) };
}
exports.getFormattedClause = getFormattedClause;
function getFormattedTimeClauseValues(clause, timezone) {
    if (clause instanceof filter_clause_1.FixedTimeFilterClause) {
        return time_1.formatTimeRange(clause.values.get(0), timezone);
    }
    var period = clause.period, duration = clause.duration;
    switch (period) {
        case filter_clause_1.TimeFilterPeriod.PREVIOUS:
            return constants_1.STRINGS.previous + " " + getQualifiedDurationDescription(duration);
        case filter_clause_1.TimeFilterPeriod.CURRENT:
            return constants_1.STRINGS.current + " " + getQualifiedDurationDescription(duration);
        case filter_clause_1.TimeFilterPeriod.LATEST:
            return constants_1.STRINGS.latest + " " + getQualifiedDurationDescription(duration);
    }
}
function getQualifiedDurationDescription(duration) {
    if (duration.toString() === "P3M") {
        return constants_1.STRINGS.quarter.toLowerCase();
    }
    else {
        return duration.getDescription();
    }
}
//# sourceMappingURL=formatter.js.map