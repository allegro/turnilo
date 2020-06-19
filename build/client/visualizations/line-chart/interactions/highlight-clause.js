"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var plywood_1 = require("plywood");
var date_range_1 = require("../../../../common/models/date-range/date-range");
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
var is_valid_clause_1 = require("../utils/is-valid-clause");
function toFilterClause(range, reference) {
    if (plywood_1.TimeRange.isTimeRange(range)) {
        var dateRange = new date_range_1.DateRange(range);
        var values = immutable_1.List.of(dateRange);
        return new filter_clause_1.FixedTimeFilterClause({ reference: reference, values: values });
    }
    if (plywood_1.NumberRange.isNumberRange(range)) {
        var numberRange = new filter_clause_1.NumberRange(range);
        var values = immutable_1.List.of(numberRange);
        return new filter_clause_1.NumberFilterClause({ reference: reference, values: values });
    }
    throw new Error("Expected Number or Time range, got: " + range);
}
exports.toFilterClause = toFilterClause;
function toPlywoodRange(clause) {
    if (!is_valid_clause_1.isValidClause(clause)) {
        throw new Error("Expected Number or FixedTime Filter Clause. Got " + clause);
    }
    var value = clause.values.first();
    return plywood_1.Range.fromJS(value);
}
exports.toPlywoodRange = toPlywoodRange;
//# sourceMappingURL=highlight-clause.js.map