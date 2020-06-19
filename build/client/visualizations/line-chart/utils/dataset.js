"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var functional_1 = require("../../../../common/utils/functional/functional");
var constants_1 = require("../../../config/constants");
exports.selectMainDatum = function (dataset) {
    return dataset.data[0];
};
exports.selectSplitDataset = function (datum) {
    return datum[constants_1.SPLIT];
};
var selectDatums = function (dataset) {
    return dataset.data;
};
exports.selectSplitDatums = functional_1.compose(exports.selectSplitDataset, selectDatums);
exports.selectFirstSplitDataset = functional_1.compose(exports.selectMainDatum, exports.selectSplitDataset);
exports.selectFirstSplitDatums = functional_1.compose(exports.selectFirstSplitDataset, selectDatums);
//# sourceMappingURL=dataset.js.map