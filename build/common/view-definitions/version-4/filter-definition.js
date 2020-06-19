"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chronoshift_1 = require("chronoshift");
var immutable_1 = require("immutable");
var date_range_1 = require("../../models/date-range/date-range");
var filter_clause_1 = require("../../models/filter-clause/filter-clause");
var FilterType;
(function (FilterType) {
    FilterType["boolean"] = "boolean";
    FilterType["number"] = "number";
    FilterType["string"] = "string";
    FilterType["time"] = "time";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
var booleanFilterClauseConverter = {
    toFilterClause: function (_a, _b) {
        var not = _a.not, values = _a.values;
        var name = _b.name;
        return new filter_clause_1.BooleanFilterClause({ reference: name, not: not, values: immutable_1.Set(values) });
    },
    fromFilterClause: function (_a) {
        var values = _a.values, not = _a.not, reference = _a.reference;
        return {
            type: FilterType.boolean,
            ref: reference,
            values: values.toArray(),
            not: not
        };
    }
};
var stringFilterClauseConverter = {
    toFilterClause: function (_a, dimension) {
        var action = _a.action, not = _a.not, values = _a.values;
        if (action === null) {
            throw Error("String filter action cannot be empty. Dimension: " + dimension);
        }
        if (!Object.values(filter_clause_1.StringFilterAction).includes(action)) {
            throw Error("Unknown string filter action. Dimension: " + dimension);
        }
        if (action in [filter_clause_1.StringFilterAction.CONTAINS, filter_clause_1.StringFilterAction.MATCH] && values.length !== 1) {
            throw Error("Wrong string filter values: " + values + " for action: " + action + ". Dimension: " + dimension);
        }
        var name = dimension.name;
        return new filter_clause_1.StringFilterClause({
            reference: name,
            action: action,
            not: not,
            values: immutable_1.Set(values)
        });
    },
    fromFilterClause: function (_a) {
        var action = _a.action, reference = _a.reference, not = _a.not, values = _a.values;
        return {
            type: FilterType.string,
            ref: reference,
            action: action,
            values: values.toArray(),
            not: not
        };
    }
};
var numberFilterClauseConverter = {
    toFilterClause: function (_a, _b) {
        var not = _a.not, ranges = _a.ranges;
        var name = _b.name;
        return new filter_clause_1.NumberFilterClause({ not: not, values: immutable_1.List(ranges.map(function (range) { return new filter_clause_1.NumberRange(range); })), reference: name });
    },
    fromFilterClause: function (_a) {
        var not = _a.not, reference = _a.reference, values = _a.values;
        return {
            type: FilterType.number,
            ref: reference,
            not: not,
            ranges: values.toJS()
        };
    }
};
var timeFilterClauseConverter = {
    toFilterClause: function (filterModel, dimension) {
        var timeRanges = filterModel.timeRanges, timePeriods = filterModel.timePeriods;
        if (timeRanges === undefined && timePeriods === undefined) {
            throw Error("Time filter must have one of: timeRanges or timePeriods property. Dimension: " + dimension);
        }
        if (timeRanges !== undefined && timeRanges.length !== 1) {
            throw Error("Time filter support a single timeRange only. Dimension: " + dimension);
        }
        if (timePeriods !== undefined && timePeriods.length !== 1) {
            throw Error("Time filter support a single timePeriod only. Dimension: " + dimension);
        }
        var name = dimension.name;
        if (timeRanges !== undefined) {
            return new filter_clause_1.FixedTimeFilterClause({
                reference: name,
                values: immutable_1.List(timeRanges.map(function (range) { return new date_range_1.DateRange({ start: new Date(range.start), end: new Date(range.end) }); }))
            });
        }
        var _a = timePeriods[0], duration = _a.duration, step = _a.step, type = _a.type;
        return new filter_clause_1.RelativeTimeFilterClause({
            reference: name,
            duration: chronoshift_1.Duration.fromJS(duration).multiply(Math.abs(step)),
            period: timeFilterPeriod(step, type)
        });
    },
    fromFilterClause: function (filterClause) {
        var reference = filterClause.reference;
        if (filterClause instanceof filter_clause_1.RelativeTimeFilterClause) {
            var duration = filterClause.duration, period = filterClause.period;
            var step = period === filter_clause_1.TimeFilterPeriod.CURRENT ? 1 : -1;
            var type = period === filter_clause_1.TimeFilterPeriod.LATEST ? "latest" : "floored";
            return {
                type: FilterType.time,
                ref: reference,
                timePeriods: [{ duration: duration.toString(), step: step, type: type }]
            };
        }
        var values = filterClause.values;
        return {
            type: FilterType.time,
            ref: reference,
            timeRanges: values.map(function (value) { return ({ start: value.start.toISOString(), end: value.end.toISOString() }); }).toArray()
        };
    }
};
function timeFilterPeriod(step, type) {
    if (type === "latest") {
        return filter_clause_1.TimeFilterPeriod.LATEST;
    }
    if (step === 1) {
        return filter_clause_1.TimeFilterPeriod.CURRENT;
    }
    return filter_clause_1.TimeFilterPeriod.PREVIOUS;
}
var filterClauseConverters = {
    boolean: booleanFilterClauseConverter,
    number: numberFilterClauseConverter,
    string: stringFilterClauseConverter,
    time: timeFilterClauseConverter
};
exports.filterDefinitionConverter = {
    toFilterClause: function (clauseDefinition, dataCube) {
        if (clauseDefinition.ref == null) {
            throw new Error("Dimension name cannot be empty.");
        }
        var dimension = dataCube.getDimension(clauseDefinition.ref);
        if (dimension == null) {
            throw new Error("Dimension " + clauseDefinition.ref + " not found in data cube " + dataCube.name + ".");
        }
        var clauseConverter = filterClauseConverters[clauseDefinition.type];
        return clauseConverter.toFilterClause(clauseDefinition, dimension);
    },
    fromFilterClause: function (filterClause) {
        if (filterClause instanceof filter_clause_1.BooleanFilterClause) {
            return booleanFilterClauseConverter.fromFilterClause(filterClause);
        }
        if (filterClause instanceof filter_clause_1.NumberFilterClause) {
            return numberFilterClauseConverter.fromFilterClause(filterClause);
        }
        if (filterClause instanceof filter_clause_1.FixedTimeFilterClause || filterClause instanceof filter_clause_1.RelativeTimeFilterClause) {
            return timeFilterClauseConverter.fromFilterClause(filterClause);
        }
        if (filterClause instanceof filter_clause_1.StringFilterClause) {
            return stringFilterClauseConverter.fromFilterClause(filterClause);
        }
        throw Error("Unrecognized filter clause type " + filterClause);
    }
};
//# sourceMappingURL=filter-definition.js.map