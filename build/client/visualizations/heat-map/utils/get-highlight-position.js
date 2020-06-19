"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
var nested_dataset_1 = require("./nested-dataset");
function clausePredicate(clause) {
    switch (clause.type) {
        case filter_clause_1.FilterTypes.BOOLEAN:
            return function (datum) { return datum[clause.reference] === clause.values.first(); };
        case filter_clause_1.FilterTypes.NUMBER:
            return function (datum) { return clause.values.first().equals(datum[clause.reference]); };
        case filter_clause_1.FilterTypes.STRING:
            return function (datum) { return String(datum[clause.reference]) === clause.values.first(); };
        case filter_clause_1.FilterTypes.FIXED_TIME:
            return function (datum) { return clause.values.first().equals(datum[clause.reference]); };
        case filter_clause_1.FilterTypes.RELATIVE_TIME:
            throw new Error("Unsupported filter type for highlights");
    }
}
function findDatumIndexByClause(data, clause) {
    return data.findIndex(clausePredicate(clause));
}
function getHighlightPosition(highlight, essence, dataset) {
    if (!highlight)
        return null;
    var splits = essence.splits.splits;
    var clauses = highlight.clauses;
    var firstSplit = splits.get(0);
    var secondSplit = splits.get(1);
    var columnSplitReference = secondSplit.reference;
    var rowSplitReference = firstSplit.reference;
    var columnClause = clauses.find(function (_a) {
        var reference = _a.reference;
        return reference === columnSplitReference;
    });
    var rowClause = clauses.find(function (_a) {
        var reference = _a.reference;
        return reference === rowSplitReference;
    });
    var row = rowClause ? findDatumIndexByClause(dataset, rowClause) : null;
    var column = columnClause ? findDatumIndexByClause(nested_dataset_1.nestedDataset(dataset[row || 0]), columnClause) : null;
    return {
        row: row,
        column: column
    };
}
exports.default = getHighlightPosition;
//# sourceMappingURL=get-highlight-position.js.map