"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var date_range_1 = require("../../../../common/models/date-range/date-range");
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
var split_1 = require("../../../../common/models/split/split");
function getFilterFromDatum(splits, flatDatum) {
    var splitNesting = flatDatum["__nest"];
    var splitCombines = splits.splits;
    if (splitNesting === 0 || splitNesting > splitCombines.size)
        return null;
    var filterClauses = splitCombines
        .take(splitNesting)
        .map(function (_a) {
        var reference = _a.reference, type = _a.type;
        var segment = flatDatum[reference];
        switch (type) {
            case split_1.SplitType.number:
                return new filter_clause_1.NumberFilterClause({ reference: reference, values: immutable_1.List.of(new filter_clause_1.NumberRange(segment)) });
            case split_1.SplitType.time:
                return new filter_clause_1.FixedTimeFilterClause({ reference: reference, values: immutable_1.List.of(new date_range_1.DateRange(segment)) });
            case split_1.SplitType.string:
                return new filter_clause_1.StringFilterClause({ reference: reference, action: filter_clause_1.StringFilterAction.IN, values: immutable_1.Set.of(segment) });
        }
    });
    return immutable_1.List(filterClauses);
}
exports.getFilterFromDatum = getFilterFromDatum;
//# sourceMappingURL=filter-for-datum.js.map