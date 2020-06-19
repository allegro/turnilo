"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dataset_1 = require("../utils/dataset");
var legend_1 = require("./legend");
exports.SplitLegend = function (props) {
    var essence = props.essence, dataset = props.dataset;
    var legendSplit = essence.splits.splits.first();
    var legendDimension = essence.dataCube.getDimension(legendSplit.reference);
    var title = legendSplit.getTitle(legendDimension);
    var nestedDataset = dataset_1.selectFirstSplitDatums(dataset);
    var values = nestedDataset.map(function (datum) { return String(datum[legendSplit.reference]); });
    return React.createElement(legend_1.Legend, { values: values, title: title });
};
//# sourceMappingURL=split-legend.js.map