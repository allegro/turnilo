"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nested_dataset_1 = require("./nested-dataset");
function getDataColumn(dataset, column) {
    var dataColumn = nested_dataset_1.nestedDataset(dataset)[column];
    return dataColumn ? dataColumn : null;
}
function datumByPosition(dataset, position) {
    var column = position.column, row = position.row;
    var dataRow = dataset[row];
    if (!dataRow)
        return [null, getDataColumn(dataset[0], column)];
    return [dataRow, getDataColumn(dataRow, column)];
}
exports.default = datumByPosition;
//# sourceMappingURL=datum-by-position.js.map