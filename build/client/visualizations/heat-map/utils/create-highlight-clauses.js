"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immutable_1 = require("immutable");
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
var general_1 = require("../../../../common/utils/general/general");
var labeled_heatmap_1 = require("../labeled-heatmap");
var nested_dataset_1 = require("./nested-dataset");
function splitSelection(split, offset, dataCube, dataset) {
    var dimensionName = split.reference;
    var dimension = dataCube.getDimension(dimensionName);
    var labelIndex = Math.floor(offset / labeled_heatmap_1.TILE_SIZE);
    if (labelIndex > dataset.length - 1) {
        return null;
    }
    var value = dataset[labelIndex][dimensionName];
    return { value: value, dimension: dimension };
}
function firstSplitSelection(topOffset, essence, dataset) {
    var dataCube = essence.dataCube, splits = essence.splits.splits;
    var split = splits.get(0);
    return splitSelection(split, topOffset, dataCube, dataset);
}
function secondSplitSelection(leftOffset, essence, dataset) {
    var dataCube = essence.dataCube, splits = essence.splits.splits;
    var split = splits.get(1);
    return splitSelection(split, leftOffset, dataCube, nested_dataset_1.nestedDataset(dataset[0]));
}
function splitSelectionToClause(_a) {
    var value = _a.value, _b = _a.dimension, kind = _b.kind, reference = _b.name;
    switch (kind) {
        case "string":
            return new filter_clause_1.StringFilterClause({ reference: reference, action: filter_clause_1.StringFilterAction.IN, values: immutable_1.Set.of(String(value)) });
        case "boolean":
            return new filter_clause_1.BooleanFilterClause({ reference: reference, values: immutable_1.Set.of(value) });
        case "time":
            return new filter_clause_1.FixedTimeFilterClause({ reference: reference, values: immutable_1.List.of(value) });
        case "number":
            return new filter_clause_1.NumberFilterClause({ reference: reference, values: immutable_1.List.of(value) });
    }
}
function isClickablePart(part) {
    return part === "body" || part === "top-gutter" || part === "left-gutter";
}
exports.isClickablePart = isClickablePart;
function pickSplitSelections(_a, essence, dataset) {
    var x = _a.x, y = _a.y, part = _a.part;
    switch (part) {
        case "top-gutter":
            return [secondSplitSelection(x, essence, dataset)];
        case "left-gutter":
            return [firstSplitSelection(y, essence, dataset)];
        case "body":
            return [firstSplitSelection(y, essence, dataset), secondSplitSelection(x, essence, dataset)];
    }
}
function createHighlightClauses(position, essence, dataset) {
    var selections = pickSplitSelections(position, essence, dataset);
    if (selections.every(general_1.isTruthy)) {
        return selections.map(splitSelectionToClause);
    }
    return [];
}
exports.default = createHighlightClauses;
//# sourceMappingURL=create-highlight-clauses.js.map